FROM openresty/openresty:1.27.1.2-bullseye

RUN apt-get update && apt-get install -y git curl build-essential libreadline-dev

# Remove any older luarocks if installed
RUN apt-get remove -y luarocks || true

# Install LuaRocks 3.9.2 (latest as of 2025-05)
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    git \
    build-essential \
    libreadline-dev 

# Install LuaRocks 3.9.2 manually
WORKDIR /tmp
RUN curl -L -O https://luarocks.org/releases/luarocks-3.9.2.tar.gz \
    && tar zxpf luarocks-3.9.2.tar.gz \
    && cd luarocks-3.9.2 \
    && ./configure --prefix=/usr/local \
       --with-lua=/usr/local/openresty/luajit \
       --with-lua-include=/usr/local/openresty/luajit/include/luajit-2.1 \
    && make build \
    && make install \
    && cd .. \
    && rm -rf luarocks-3.9.2 luarocks-3.9.2.tar.gz

ENV PATH="/usr/local/openresty/luajit/bin:${PATH}"

RUN git clone https://github.com/SkyLothar/lua-resty-jwt.git /usr/local/openresty/lualib/lua-resty-jwt
RUN git clone https://github.com/ledgetech/lua-resty-http.git /usr/local/openresty/lualib/lua-resty-http


