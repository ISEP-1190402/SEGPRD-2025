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
local secret = "your_jwt_secret"
local signing_input = header_b64 .. "." .. payload_b64

local h = hmac.new(secret, "sha256")
h:update(signing_input)
local expected_sig = h:final()

local function base64url_encode(data)
    return ngx.encode_base64(data)
        :gsub("+", "-")
        :gsub("/", "_")
        :gsub("=", "")
end

local function base64url_decode(data)
    data = data:gsub("-", "+"):gsub("_", "/")
    local padding = 4 - (#data % 4)
    if padding < 4 then
        data = data .. string.rep("=", padding)
    end
    return ngx.decode_base64(data)
end

local expected_sig_b64url = base64url_encode(expected_sig)
if expected_sig_b64url ~= signature_b64 then
    ngx.status = ngx.HTTP_UNAUTHORIZED
    ngx.say("Invalid JWT signature")
    return ngx.exit(ngx.HTTP_UNAUTHORIZED)
end

-- Authorization Logic
local permission_map = {
    ["/resources/grades:GET"] = "view:grade",
    ["/resources/grades:POST"] = "create:grade",
    ["/resources/materials:GET"] = "view:material",
    ["/resources/materials:POST"] = "create:material",
    ["/resources/forms:GET"] = "manage:forms",
    ["/resources/forms:POST"] = "manage:forms",
    ["/resources/forms:DELETE"] = "manage:forms",
    ["/resources/announcements:POST"] = "create:announcement",
    ["/resources/announcements:GET"] = "view:announcement"
}
  
local path = ngx.var.uri
local method = ngx.req.get_method()
local permission = permission_map[path .. ":" .. method]

if not permission then
    return ngx.exit(ngx.HTTP_FORBIDDEN)
end

-- Always read body for POST/PUT
if ngx.req.get_method() ~= "GET" then
    ngx.req.read_body()
end

-- Send request to policy service
local httpc = http.new()
ngx.log(ngx.ERR, "Sending to policy service: role=", payload.role, " permission=", permission)
local res, err = httpc:request_uri("http://172.18.0.3:3002/policy/evaluate", {
  method = "POST",
  body = cjson.encode({
    role = payload.role,
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

