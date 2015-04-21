# a-star

Generic synchronous [A* search algorithm](http://en.wikipedia.org/wiki/A*_search_algorithm).

## Usage

```js
import { default as aStar } from 'es6-a-star';
// if this is going to take a while you may want to child_process.fork
// and pass the results to the parent process
// see below for options
var path = aStar(options);
console.log(path);
```

## Documentation

`aStar(options)`

### Return Value

Returns an object that looks like this:

```js
{
  status: 'success', // one of ['success', 'noPath', 'timeout']
  path: [startNode, node1, node2, ..., endNode],
  cost: cost, // cost of path
}
```

If `status` is:

 * `success` - a path was found and `path` is an array of nodes including start
   and end.
 * `noPath` - there is no path from start to end. `path` is the path to the
   closest node to end that could be found.
 * `timeout` - no path was found in the allotted time. `path` is the path to
   the closest node that could be found in the allotted time.

### Parameters

 * `start` - the start node. Can be anything.
 * `isEnd` - function(node) that returns whether a node is an acceptable end
 * `neighbor` - function(node) that returns an array of neighbors for a node
 * `distance` - function(a, b) that returns the distance cost between two
   nodes
 * `heuristic` - function(node) that returns a heuristic guess of the cost
   from `node` to an end.
 * `hash` (optional) - function(node) that returns a unique string for a node. this is
   so that we can put nodes in heap and set data structures which are based
   on plain old JavaScript objects. Defaults to using `node.toString`.
 * `timeout` (optional) - limit to amount of milliseconds to search before
   returning null.

The data type for nodes is unrestricted.
