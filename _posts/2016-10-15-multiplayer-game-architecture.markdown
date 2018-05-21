---
layout: post
title: Multiplayer game architecture demo in TypeScript 2.0
description: A simulation of a fast paced multiplayer game in TypeScript 2.0
published: true
---

Try out [**my demo**](https://www.proofbyexample.com/demos/fpmclone) if
you're interested. The code is [here](https://github.com/overthink/fpmclone).
It's written in TypeScript 2.0 for mental health reasons.

[![Screenshot of fast paced multiplayer demo](/img/fpmscreenshot.png "Click to try my demo")](https://www.proofbyexample.com/demos/fpmclone)
{: style="text-align: center" }

Recently, I've been interested in various aspects of game development.  One
area of particular interest is how multiplayer games engines generally work
(and deal with state).  I came across an excellent series of articles on the
[architecture of client-server
games](http://www.gabrielgambetta.com/fast_paced_multiplayer.html) by Gabriel
Gambetta.  Read these!  At the end of the articles he presents a neat [live
demo](http://www.gabrielgambetta.com/fpm_live.html) to make concrete the ideas
discussed.

I decided to make a clone of Gabriel's demo so I could better understand how it
worked.  Once I got into it, I also added entity interpolation, which is talked
about in the articles, but not implemented in the original demo.

