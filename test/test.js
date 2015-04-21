global.System = require('es6-module-loader').System;

var expect = require('chai').expect;
var aStar;

// shallow entry-wise comparison
function arraysEqual(array1, array2) {
  if (array1.length !== array2.length) return false;
  for (var i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) return false;
  }
  return true;
}

var euclideanDistance = function(a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1];
    return Math.sqrt(dx * dx + dy * dy);
};

var rectilinearDistance = function(a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1];
    return Math.abs(dx) + Math.abs(dy);
};

var planarNeighbors = function(xy) {
    var x = xy[0], y = xy[1];
    return [
        [x - 1, y - 1],
        [x - 1, y + 0],
        [x - 1, y + 1],
        [x + 0, y - 1],

        [x + 0, y + 1],
        [x + 1, y - 1],
        [x + 1, y + 0],
        [x + 1, y + 1],
    ];
};

describe('A star', function() {
    before(function(done) {
        System.import('index').then(function(module) {
            aStar = module.default;
            done();
        }).catch(function(error) {
            console.error(error);
        })
    })
    
    it('should find a direct path on the number line', function() {
        // Start at 5 and find a path to 0 along a number line.
        var results = aStar({
            start: 5,
            isEnd: function(n) { return n === 0; },
            neighbor: function(x) { return [x - 1, x + 1]; },
            distance: function(a, b) { return 1; },
            heuristic: function(x) { return x; },
        });
        expect(results.status).to.equal('success');
        expect(results.path).to.eql([5, 4, 3, 2, 1, 0]);
    });

    /**
     * A simple 2-d test with 8 neighbors per cell.
     * Solution is a diagonal line directly from size,size to 0,0.
     */
    it('should find a diagonal path in a euclidean plane', function() {
        function testPlane(size) {
            var end = [0, 0];
            var results = aStar({
                start: [size, size],
                isEnd: function(n) {return n[0] === end[0] && n[1] === end[1];},
                neighbor: planarNeighbors,
                distance: euclideanDistance,
                heuristic: function(xy) {
                    return rectilinearDistance(xy, end);
                },
            });
            
            var expectedPath = [];
            while(expectedPath.push([size, size]) && size--);
            
            expect(results.status).to.equal('success');
            expect(results.path).to.eql(expectedPath);
        }
        testPlane(5);
        testPlane(50);
    });

    it('should navigate a maze', function() {
        /**
         * Tests navigating a maze.
         * @param maze Array of strings. '#' is wall, 's' is start, 'e' is end, anything else is floor. Maze must be bordered by '#' signs.
         * @param targetLength The number of nodes in the answer including the start and the end, or null if the maze is impossible.
         * @param alternateLength The length of the closest path when a legal path doesn't exist
         */
        function testMaze(maze, targetLength, alternateLength) {
            // find the start and end positions
            var start;
            for (var y = 0; y < maze.length; y++) {
                var startX = maze[y].indexOf("s");
                if (startX !== -1) {
                    start = [startX, y];
                    break;
                }
            }
            var end;
            for (y = 0; y < maze.length; y++) {
                var endX = maze[y].indexOf("e");
                if (endX !== -1) {
                    end = [endX, y];
                    break;
                }
            }

            var results = aStar({
                start: start,
                isEnd: function(n) {return n[0] === end[0] && n[1] === end[1];},
                neighbor: function(xy) {
                  return planarNeighbors(xy).filter(function(xy) {
                    // cell is walkable if it's not a "#" sign
                    return maze[xy[1]].charAt(xy[0]) !== "#";
                  });
                },
                distance: euclideanDistance,
                heuristic: function(xy) {
                  return euclideanDistance(xy, end);
                },
            });
            if (targetLength != null) {
                expect(results.status).to.equal('success');
                expect(results.path.length).to.equal(targetLength);
            } else {
                expect(results.status).to.equal('noPath');
                expect(results.path.length).to.equal(alternateLength);
            }
        }
        testMaze([
            "###########",
            "# #       #",
            "#e# s ## ##",
            "# #       #",
            "# ## #### #",
            "#         #",
            "###########",
        ], 8);
        testMaze([
            "###########",
            "#e#   s   #",
            "# #   ## ##",
            "# #       #",
            "# ####### #",
            "#         #",
            "###########",
        ], 16);
        testMaze([
            "###########",
            "#e#   s   #",
            "# #   ## ##",
            "# #       #",
            "# ####### #",
            "#     #   #",
            "###########",
        ], null, 4);

        // every 10 cells (including start) is marked by a digit
        testMaze([
            "##################################################################",
            "# #    2          #           ######## ######## # # ## #    # # ##",
            "# #### #### # ########## ############# #        # # ## #    # # ##",
            "#         # #          # #             ######## # # ## #    # # ##",
            "# # ####### ### ######## #############        # # # ## #    # # ##",
            "# #    # #    #  3            ######## ######## # #              #",
            "# # # ## ## ### ####### # #####        ########## ########### ####",
            "# ### #   # # # ####### # ############ #                 8  # # ##",
            "### # # #            ## #4           # ########## # # ## # ## # ##",
            "#s# # ################# # ############ ##       # # # ## # ## # ##",
            "# # 1           #       # #               #######7# # ## # ## #  #",
            "# # # ##### ## ######## # ############ ## #       # # ## #e## #  #",
            "# # ###   # #         # #       5      ##6####### ########### #  #",
            "# # # # #   ## ######## ##  ########## ##                        #",
            "#   # # ###### #        #       ######### # ################# ## #",
            "# # #        # ######## ##  #####         #                 # ## #",
            "##################################################################",
        ], 84);
    });
});