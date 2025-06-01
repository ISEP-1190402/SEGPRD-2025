local jwt = require "resty.jwt"
local cjson = require "cjson"
local http = require "resty.http"

local token = ngx.var.http_authorization
if not token then
    ngx.status = ngx.HTTP_UNAUTHORIZED
    ngx.say("Missing Authorization header")
    return ngx.exit(ngx.HTTP_UNAUTHORIZED)
end

local jwt_obj = jwt:verify("your-secret-key", token:sub(8)) -- remove "Bearer "

if not jwt_obj.verified then
    ngx.status = ngx.HTTP_UNAUTHORIZED
    ngx.say("Invalid JWT: " .. jwt_obj.reason)
    return ngx.exit(ngx.HTTP_UNAUTHORIZED)
end

local permission_map = {
    ["/grades:GET"] = "view:grade",
    ["/grades:POST"] = "create:grade",
    ["/materials:GET"] = "view:material",
    ["/forms:DELETE"] = "manage:forms"
}
  
local path = ngx.var.uri
local method = ngx.req.get_method()
local permission = permission_map[path .. ":" .. method]

if not permission then
    return ngx.exit(ngx.HTTP_FORBIDDEN)
end


-- Send request to policy service
local httpc = http.new()
local res, err = httpc:request_uri("http://localhost:3002/policy/evaluate", {
  method = "POST",
  body = cjson.encode({
    role = decoded_jwt.payload.role,
    permission = permission
  }),
  headers = {
    ["Content-Type"] = "application/json"
  }
})


if not res then
    ngx.log(ngx.ERR, "Policy service error: ", err)
    return ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
end
  
local body = cjson.decode(res.body)
if not body.allowed then
    return ngx.exit(ngx.HTTP_FORBIDDEN)
end

