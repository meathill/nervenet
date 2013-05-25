Nerve Net
==========

A framework help user to create namespace, event bus and dependency inject

## 设计思路 ##

仿照robotlegs的做法，创建一个context，将所有要运行的内容放置在这个context中，需要的内容通过injector获取，需要其它组件配合的工作通过event bus广播。