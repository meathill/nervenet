Nerve Net
==========

A framework help user to create namespace, event bus and dependency inject

## 要解决的问题

限于JavaScript自身的设计，在实际开发中我们会遭遇一些问题，项目越大就会越明显：

1. 没有命名空间，不易管理代码。
2. 缺少包管理，不需要编译，难以管理依赖。
3. 如果项目较大，我们需要某种工具来调控组件之间的动作
4. 在实际开发中，我们还希望能对单例进行自动化管理

## 灵感来源

在ActionScript平台上有个MVC框架叫Robotlegs。本类库的功能基本都移植自Robotlegs，并根据JavaScript的语言特性进行修改。

## 用法

