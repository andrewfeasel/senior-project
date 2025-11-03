package com.andrew;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.http.HttpServer;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.StaticHandler;


public class WebServer extends AbstractVerticle {
  @Override
  public void start() {
    HttpServer server = vertx.createHttpServer();
    
    Router router = Router.router(vertx);
    router.route("/*").handler(StaticHandler.create("app"));
    
    server.requestHandler(router);
    server.listen(8080);
  }
}