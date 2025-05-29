local jwt = require "resty.jwt"

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
