/*- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -*/
/*
/* Linked List class
/*
/* Not very thorough (yet) LL implementation
/*
/* Author: [Reed](https://github.com/reedspool)
/*
/*- -~- -*/

/**
 * Linked List "Class"
 * 
 * @param {*}   value The value of this node
 * @param {Function} next optional, existing LinkedList node
 */
function LinkedList(value, next) {
  this.__value = value;
  this.__next = next;
}

// "Static", not using `this`

LinkedList.node = function (value, next) {
  return new LinkedList(value, next)
}

LinkedList.fromArray = function (arr) {
  var holder = LinkedList.node();

  // Reduce, adding to the new list as we go
  arr.reduce(function (current, memo, index) {
      memo.setNext(LinkedList.node(current));

      return memo.getNext();
    }, holder);

  // Get our "holder"s next value, which is actually first in list
  return holder.getNext();
}

// Non-mutating accessors

LinkedList.prototype.copy = function () {
  return LinkedList.node(this.getValue(), this.getNext());
}

LinkedList.prototype.getValue = function () {
  return this.__value;
}

LinkedList.prototype.getNext = function () {
  return this.__next;
}

LinkedList.prototype.reduce = function (fn, memo) {
  var current = this;

  // If memo is not present
  if ( ! memo )
  {
    // A single node list with no initial value reduces to that nodes value
    if ( ! this.getNext() ) {
      return this.getValue();
    }

    // Then, skip the first one and use it as memo
    memo = this.getValue();
    current = this.getNext();
  }

  var index = 0;

  // Iterate through each element, applying function
  while (current) {
    memo = fn.call(this, current.getValue(), memo, index);

    index += 1;
    current = current.getNext();
  }

  return memo;
}

LinkedList.prototype.forEach = function (fn) {
  // Reduce, and throw away the result (use arbitrary truthy value for memo)
  this.reduce(function (current, memo, index) {
    fn.call(this, current, index);
  }, true);

  return;
}

LinkedList.prototype.map = function (fn) {
  var holder = LinkedList.node();

  // Reduce, adding to the new list as we go
  this.reduce(function (current, memo, index) {
    memo.setNext(
        LinkedList.node(fn.call(this, current, index));
      );

    return memo.getNext();
  }, holder);

  // Get our "holder"s next value, which is actually first in list
  return holder.getNext();
}

// Mutators/side effects

LinkedList.prototype.setNext = function (next) {
  this.__next = next;

  // Return self for chaining
  return this;
}

/**
 * Linked List "Class"
 * 
 * @param {*}   value The value of this node
 * @param {Function} next optional, existing LinkedList node
 */
function LinkedListDeque() {
  this.__head = null;
  this.__tail = null;
  this.size = 0;
}

// Non-mutating accessors

LinkedListDeque.prototype.reduce = function (a,r,g,s) {
  return this.__head.reduce.apply(this.__head, arguments);
}

LinkedListDeque.prototype.map = function (a,r,g,s) {
  return this.__head.map.apply(this.__head, arguments);
}

LinkedListDeque.prototype.forEach = function (a,r,g,s) {
  return this.__head.forEach.apply(this.__head, arguments);
}

// Mutators/side effects

LinkedListDeque.prototype.unshift = function (value)
{
  var lastHead = this.__head;

  this.__head = LinkedList.node(value, lastHead);

  lastHead.__prev = this.__head;

  this.size++;
}

LinkedListDeque.prototype.shift = function ()
{
  var lastHead = this.__head;

  this.__head = lastHead.getNext();

  this.size--;
   
  return lastHead.getValue();
}

LinkedListDeque.prototype.push = function (value)
{
  var lastTail = this.__tail;

  this.__tail = LinkedList.node(value, lastTail);

  lastTail.setNext(this.__tail);

  this.size++;
}

LinkedListDeque.prototype.pop = function ()
{
  var lastTail = this.__tail;

  this.__tail = lastTail.__prev;

  this.size--;
   
  return lastTail.getValue();
}

LinkedListDeque.prototype.size = function ()
{
  return this.size;
}

