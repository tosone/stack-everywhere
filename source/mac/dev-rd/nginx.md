title: NGinx服务器 
---

## Nginx安装

执行下面命令安装最新版的Nginx：

```bash
brew install nginx
```

安装成功之后可以查看帮助信息：

```bash
# 查看帮助信息

nginx -h

Usage: nginx [-?hvVtq] [-s signal] [-c filename] [-p prefix] [-g directives]

Options:
  -?,-h         : 帮助信息
  -v            : 查看版本号
  -V            : 查看版本号跟配置信息
  -t            : 测试配置信息是否无误
  -q            : 执行测试配置信息的时候阻止非错误信息的输出
  -s signal     : 发送信号: stop(停止), quit(退出), reopen(重启), reload(重新加载配置)
  -p prefix     : 设置nginx的前缀 (默认: /usr/local/Cellar/nginx/1.8.0/)
  -c filename   : 设置配置文件位置 (默认: /usr/local/etc/nginx/nginx.conf)
  -g directives : 设置全局指令

```

## 启动服务

```bash
sudo nginx
```

然后在网页打开`http://localhost:8080`看到`Nginx`的欢迎信息说明启动成功。

默认情况下Nginx监听了`8080`这个端口号，若需要修改监听端口号，可以编辑`/usr/local/etc/nginx/nginx.conf`这个文件，但是若要改成`80`端口号而且不是`root`用户登录的话是不会生效的，所以需要执行下面代码：

```bash
sudo chown root:wheel /usr/local/Cellar/nginx/1.8.0/bin/nginx (nginx的实际安装路径)
sudo chmod u+s /usr/local/Cellar/nginx/1.8.0/bin/nginx
```

一般情况下修改了`配置信息`之后都需要执行下面命令测试`配置信息`是否无误然后重新启动服务器：

```bash
nginx -t && nginx -s reopen
```

### 设置Nginx为开机启动

```bash
ln -sfv /usr/local/opt/nginx/*.plist ~/Library/LaunchAgents
launchctl load ~/Library/LaunchAgents/homebrew.mxcl.nginx.plist
```

## Nginx配置

`Nginx`的配置文件主要分四个部分：

### main（全局设置）  

   **这部分的指令将会影响其他部分的设置**
   
   - worker_processes 2
      
      在配置文件的顶级*main*部分，worker角色的工作进程的个数，master进程是接收并分配给worker处理。一般情况下这个值可以设置为CPU的核数，如果开启了ssl和gzip一般设置为CPU数量的2倍，可以减少I/O操作。如果Nginx服务器还有其它服务，可以考虑适当减少。
   	  
   - worker_connections 2048
      
      这个写在*events*部分，每一个worker进程能并发处理（发起）的最大连接数。Nginx作为反向代理服务器，计算公式`最大连接数 = worker_processes * worker_connections / 4`，所以这里客户端最大连接数是1024，这个可以增到8192，但不能超过`worker_rlimit_nofile`。当Nginx作为http服务器时，计算公式里面是除以2.
   	  
   - worker_ rlimit_ nofile 10240

  	  写在*main*部分，默认没有设置，可以限制为操作系统最大的限制65535。
   	  
   - use epoll
   
     写在*events*部分，在Linux操作系统下，Nginx默认使用epoll事件模型，得益于此，Nginx在Linux操作系统下效率相当高。同时Nginx在OpenBSD或FreeBSD操作系统上采用类似于epoll的高效事件模型kqueue。
     
### http（服务器设置）

   **提供http服务相关的一些配置参数，如：是否使用keepalive，是否使用gzip进行压缩**
   
   - sendfile on
     
     开启高效文件传输模式，sendfile指令指定Nginx是否调用sendfile函数来输出文件，减少用户空间到内核空间的上下文切换。对于普通应用设为on，如果用来进行下载等磁盘IO重负载应用，可设置为off，以平衡磁盘与网络I/O处理速度，降低系统的负载。
     
   - keepalive_timeout 65

     长连接超时时间，单位是秒，涉及到浏览器的种类、后端服务器的超时设置、操作系统的设置，相对比较敏感。
     
   - send_timeout

     指定相应客户端的超时时间，这个超时仅限于两个连接活动之间的时间，如果超过这个时间，客户端没有任何活动，Nginx将会关系连接。
          
   - client_ max_ body_ size 10m

     允许客户端请求的最大单文件字节数，一般在上传较大文件时设置限制值
   
   - client_ body_ buffer_ size 128k

     缓冲区代理缓冲用户用户端请求的最大字节数
     
### server（主机设置）

   **http服务上支持若干虚拟主机，每个虚拟主机对应一个server配置项**
   
   - listen
   
     监听端口，Mac下默认为8080，小于1024的要以root启动。可以为`listen:*:8080`、`listen:127.0.0.1:8080`等形式
     
   - server_name

     服务器名，如`localhost`、`www.jd.com`，可以通过正则匹配
     
### location（URL匹配特定位置配置）

   **http服务中，某些特定的URL对应的一系列配置项**
   
   - root html

     定义服务器的默认网站根目录。如果`location`URL匹配的是子目录或文件，`root`没什么作用，一般放在`server`指令里面或`/`下。
     
   - index index.php index.shtml index.html index.htm

     定义路径下默认访问的文件名，一般跟着`root`放
     
     
还有`http_proxy`、`http_gzip`、访问控制`allow/deny`等这里就不赘述，有兴趣可以翻看 [官方文档](http://nginx.org/en/docs/)


下面提供一份相对简单的配置文件示例：

```
user www www;
worker_processes 2;

error_log logs/error.log;

pid logs/nginx.pid;

events {
  use epoll;
  worker_connections 2048;
}

# http服务器设置
http {
  include mime.types;
  default_type application/octet-stream;
  
  sendfile on;
  
  keepalive_timeout 65;
  
  # server主机配置
  server {
    listen 8080;  #监听端口号
    server_name localhost;  #主机名
    
    charset utf-8;
    access_log logs/host.access.log main;
    
    # location 配置
    location / {
      root   html;
      index  index.php index.shtml index.html index.htm;
    }       
    
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
      root html;
    }
  }
}
```

## 其他常用设置

1. 修改端口listen

  ```
  sudo nginx -s stop
  sudo vi /usr/local/etc/nginx/nginx.conf
  # 改完后重启
  sudo nginx
  ```

2. 多站点配置

  为了灵活配置nginx的站点，可以参考以下配置：

  A. 在/usr/local/etc/nginx/下面新建两个目录：sites-available和sites-enabled

  B. 在sites-available里面新建default.conf，将nginx.conf里面的默认站点配置的内容拷贝过去，并注释掉原内容

  C. 在nginx.conf里面增加以下内容

    ```
    include /usr/local/etc/nginx/sites-enabled/*;
    ```

  D. 将sites-available目录下的配置建立symlink至site-enabled目录

    ln -sfv /usr/local/etc/nginx/sites-available/default.conf /usr/local/etc/nginx/sites-enabled/default.conf

  E. 重启nginx服务

    ```
    # restart
    sudo nginx -s stop
    sudo nginx
    ````

3. 修改默认的html站点目录

  默认的目录在这里：

  ```
  /usr/local/Cellar/nginx/1.2.3/html
  ```

  其中1.2.3是版本，根据实际按照情况不同

  跑去nginx.conf文件中修改默认目录：

  ```
  server {
    listen       80;
    server_name  localhost;

    #access_log  logs/host.access.log  main;

    location / {
        root   html;
        index  index.html index.htm;
    }
  ```

  默认目录即上面的root的地方，可以修改成用户目录，例如: /User/lv/www
