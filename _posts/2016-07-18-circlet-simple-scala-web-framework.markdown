---
layout: post
title: "Circlet and Usher - Small Web App Libraries for Scala"
description: A brief overview of Circlet and Usher, Scala libraries for creating web apps
published: true
---

[Circlet](https://github.com/overthink/circlet) and
[Usher](https://github.com/overthink/usher) are two small Scala libraries I
have been working on for fun recently.  Circlet is like
[Ring](https://github.com/ring-clojure/ring), but for Scala.  Usher is a small
routing library built on top of Circlet, and is very much like
[Compojure](https://github.com/weavejester/compojure).

These libraries encourage building web apps (REST endpoints, microservices,
etc.) by composing simple functions of type `Request => Option[Response]`, and
using higher order functions (`Middleware`) to layer on reusable functionality.

### Circlet Features

* Few features
* Minimal core concepts: `Request`, `Response`, `Handler`, `Middleware`
* Uses Scala idioms
  * case classes with immutable data
  * optional things use `Option`
  * functional style
* Few dependencies

Ok, the last point is a bit of a lie because currently
[Jetty](http://www.eclipse.org/jetty/) is required, and it's not small.  But,
having used it to handle billions of requests over the past several years I'm
comfortable forcing Jetty on people as a starting point.

### Usher Features

* no external tools, just a library
* simple routing syntax
* composable routes

### Simple examples

First, the important types are:

```scala
type Cont = Option[Response] => Sent.type
type Handler = Request => Cont => Sent.type // roughly: Request => Option[Response]
type Middleware = Handler => Handler
```

`Request` and `Response` are case classes containing the things you'd expect.
`Handler` is the workhorse, and like the comment above says, you can get by
thinking of it as having type `Request => Option[Response]`. `Cont` may require
some explanation: Circlet uses continuation passing style
([CPS](https://en.wikipedia.org/wiki/Continuation-passing_style)), and `Cont`
is the type of the continuation function.  There is more about CPS on the
[Circlet](https://github.com/overthink/circlet) GitHub page, so I won't say
more about it here.

As a point of reference, here's a Circlet app messing around with cookies:

```scala
val h = Circlet.handler { req =>
  Cookies.get(req, "id") match {
    case None =>
      val id = Random.nextInt(1000000)
      val body = s"No id yet, going to set $id (5 second ttl)"
      val c = Cookie(value = id.toString, maxAge = Some(new Duration(5000)))
      Cookies.add(Response(body = body), "id", c)
    case Some(id) =>
      Response(body = s"Id is $id")
  }
}

val mw: Middleware = Head.mw.andThen(Cookies.mw())
val app: Handler = mw(h)
JettyAdapter.run(app)
```

([full listing](https://github.com/overthink/circlet-example/blob/d9f8f90f0590bc42f0ee18e63884af1b070f207a/src/main/scala/com/markfeeney/circlet/example/Main.scala))

And here's what a single route looks like in Usher:

```scala
val r: Handler =
  GET("/saying/:id{\\d+}") { req =>
    for {
      params <- Usher.get(req)
      id <- params.getInt("id")
      result <- db.get(id)
    } yield Response(body = result)
  }
```

There's some boilerplate in unpacking `params` and `id` in the above Usher
example: if the routing works (and it does), they're guaranteed non-`None` in
that code.  However, it's not too painful as-is, reads easily, and fits the
familiar for comprehension syntax well. I have an idea for an
uglier-but-more-type-safe route syntax in the future.

([full listing](https://github.com/overthink/usher-example/blob/2dbc1b461af824ad1d082d7d027a6981e70482fd/src/main/scala/com/markfeeney/usherexample/Main.scala))

### Why yet another web framework?

Having spent a number of years with Scala web frameworks, then some more with
Ring, the idea of returning to the former (which I've always found complicated)
was depressing. I didn't want to give up writing web apps as compositions of
`Handler` functions.  So I decided to port Ring.  And if you're going to port
Ring, you might as well port Compojure too.

Also, I just wanted to do it, and it was fun.

### Current Status

These projects are new, but they should be quite usable.  If you do try them
out for anything, I'd love any feedback.  Please drop me a line here or on
[Twitter](https://twitter.com/overthink) or
[GitHub](https://github.com/overthink).

