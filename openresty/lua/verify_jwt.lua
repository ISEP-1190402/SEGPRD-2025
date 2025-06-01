local base64 = require "ngx.base64"
local cjson = require "cjson"
local hmac = require "resty.openssl.hmac"
local http = require "resty.http"

-- Extract JWT
local token = ngx.var.http_authorization
if not token then
    ngx.status = ngx.HTTP_UNAUTHORIZED
    ngx.say("Missing Authorization header")
    return ngx.exit(ngx.HTTP_UNAUTHORIZED)
end

token = token:match("Bearer%s+(.+)")
if not token then
    ngx.status = ngx.HTTP_UNAUTHORIZED
    ngx.say("Malformed Authorization header")
    return ngx.exit(ngx.HTTP_UNAUTHORIZED)
end

-- Split JWT
local header_b64, payload_b64, signature_b64 = token:match("([^%.]+)%.([^%.]+)%.([^%.]+)")
if not (header_b64 and payload_b64 and signature_b64) then
    ngx.status = ngx.HTTP_UNAUTHORIZED
    ngx.say("Invalid JWT format")
    return ngx.exit(ngx.HTTP_UNAUTHORIZED)
end

local header = cjson.decode(ngx.decode_base64(header_b64))
local payload = cjson.decode(ngx.decode_base64(payload_b64))
local signature = ngx.decode_base64(signature_b64)

-- HMAC-SHA256 Verification
local secret = "your-secret-key"
local signing_input = header_b64 .. "." .. payload_b64

local h = hmac.new(secret, "sha256")
h:update(signing_input)
local expected_sig = h:final()

if expected_sig ~= signature then
    ngx.status = ngx.HTTP_UNAUTHORIZED
    ngx.say("Invalid JWT signature")
    return ngx.exit(ngx.HTTP_UNAUTHORIZED)
end

-- Authorization Logic
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

