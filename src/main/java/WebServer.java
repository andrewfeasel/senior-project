package com.andrew;

import java.sql.*;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.http.HttpServer;
import io.vertx.core.http.ServerWebSocket;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.StaticHandler;

public class WebServer extends AbstractVerticle {
	private HttpServer server;
	private Router router;

  @Override
  public void start() {
    this.server = vertx.createHttpServer();
    this.server.webSocketHandler(ServerWebSocket ws -> {
      if (!"/chats".equals(ws.path())) {
        ws.reject();
        return;
      }
      
      ws.textMessageHandler(String message -> {
        // implement later
      });

      ws.exceptionHandler(err -> {
        System.err.println("WebSocket error: " + err.getMessage());
      });
    });

    this.router = Router.router(vertx);
    this.router.route("/*").handler(StaticHandler.create("app"));

    this.server.requestHandler(router);
    this.server.listen(8080);
  }
}
