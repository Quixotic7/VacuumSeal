var vs;
(function (vs) {
    var Node = (function () {
        function Node(val, list) {
            this.val = val;
            this._list = list;
        }
        Node.prototype.free = function () {
            this.val = null;
            this.next = this.prev = null;
            this._list = null;
        };
        Node.prototype.isHead = function () {
            return this == this._list.head;
        };
        Node.prototype.isTail = function () {
            return this == this._list.tail;
        };
        Node.prototype.hasNext = function () {
            if(this.next == undefined) {
                return false;
            }
            return this.next !== null;
        };
        Node.prototype.hasPrev = function () {
            if(this.prev == undefined) {
                return false;
            }
            return this.prev !== null;
        };
        Node.prototype.nextVal = function () {
            vs.D.assert(this.hasNext(), "Next node is null");
            return this.next.val;
        };
        Node.prototype.prevVal = function () {
            vs.D.assert(this.hasPrev(), "Prev node is null");
            return this.prev.val;
        };
        Node.prototype.getList = function () {
            return this._list;
        };
        Node.prototype.unlink = function () {
            vs.D.assert(this._list !== null, "List is null");
            return this._list.unlink(this);
        };
        Node.prototype.prepend = function (node) {
            vs.D.assert(node !== null, 'node is null');
            vs.D.assert(this.prev == null, 'prev is not null');
            vs.D.assert(this._list == null && node._list == null, 'node is managed by a list');
            node.next = this;
            this.prev = node;
            return node;
        };
        Node.prototype.append = function (node) {
            vs.D.assert(node !== null, 'node is null');
            vs.D.assert(this.next == null, 'next is not null');
            vs.D.assert(this._list == null && node._list == null, 'node is managed by a list');
            this.next = node;
            node.prev = this;
            return node;
        };
        Node.prototype.toString = function () {
            return String(this.val);
        };
        Node.prototype._unlink = function () {
            var t = this.next;
            if(this.hasPrev()) {
                this.prev.next = this.next;
            }
            if(this.hasNext()) {
                this.next.prev = this.prev;
            }
            this.next = this.prev = null;
            return t;
        };
        Node.prototype._insertAfter = function (node) {
            node.next = this.next;
            node.prev = this;
            if(this.hasNext()) {
                this.next.prev = node;
            }
            this.next = node;
        };
        Node.prototype._insertBefore = function (node) {
            node.next = this;
            node.prev = this.prev;
            if(this.hasPrev()) {
                this.prev.next = node;
            }
            this.prev = node;
        };
        return Node;
    })();
    vs.Node = Node;    
    var LinkedList = (function () {
        function LinkedList(reservedSize, maxSize) {
            if (typeof maxSize === "undefined") { maxSize = -1; }
            if(vs.D.debug) {
                if(reservedSize > 0) {
                    if(maxSize !== -1) {
                        vs.D.assert((reservedSize <= maxSize), "Reserved size is larger than max size.");
                    }
                }
                this.maxSize = (maxSize == -1) ? Number.MAX_VALUE : maxSize;
            } else {
                this.maxSize = -1;
            }
            this._reservedSize = reservedSize || 0;
            this._size = 0;
            this._poolSize = 0;
            this._circular = false;
            this._iterator = null;
            if(reservedSize > 0) {
                this._headPool = this._tailPool = new Node(null, this);
            }
            this.head = this.tail = null;
            this.key = vs.HashKey.next();
            this.reuseIterator = false;
        }
        LinkedList.prototype.isCircular = function () {
            return this._circular;
        };
        LinkedList.prototype.close = function () {
            if(this._circular) {
                return;
            }
            this._circular = true;
            if(this._valid(this.head)) {
                this.tail.next = this.head;
                this.head.prev = this.tail;
            }
        };
        LinkedList.prototype.open = function () {
            if(!this._circular) {
                return;
            }
            this._circular = false;
            if(this._valid(this.head)) {
                this.tail.next = null;
                this.head.prev = null;
            }
        };
        LinkedList.prototype.createNode = function (x) {
            return new Node(x, this);
        };
        LinkedList.prototype.add = function (x) {
            this.append(x);
            return this;
        };
        LinkedList.prototype.addAll = function (x) {
            var _this = this;
            x.forEach(function (val, i, a) {
                _this.append(val);
            });
            return this;
        };
        LinkedList.prototype.append = function (x) {
            if(vs.D.debug) {
                if(this.maxSize != -1) {
                    vs.D.assert(this.size() < this.maxSize, ("size equals max size " + this.maxSize));
                }
            }
            var node = this._getNode(x);
            if(this._valid(this.tail)) {
                this.tail.next = node;
                node.prev = this.tail;
            } else {
                this.head = node;
            }
            this.tail = node;
            if(this._circular) {
                this.tail.next = this.head;
                this.head.prev = this.tail;
            }
            this._size++;
            return node;
        };
        LinkedList.prototype.appendNode = function (x) {
            if(vs.D.debug) {
                vs.D.assert(x.getList() == this, "Node is not managed by this list");
            }
            if(this._valid(this.tail)) {
                this.tail.next = x;
                x.prev = this.tail;
            } else {
                this.head = x;
            }
            this.tail = x;
            if(this._circular) {
                this.tail.next = this.head;
                this.head.prev = this.tail;
            }
            this._size++;
        };
        LinkedList.prototype.prepend = function (x) {
            if(vs.D.debug) {
                if(this.maxSize !== -1) {
                    vs.D.assert(this.size() < this.maxSize, "size equals max size " + this.maxSize);
                }
            }
            var node = this._getNode(x);
            node.next = this.head;
            if(this._valid(this.head)) {
                this.head.prev = node;
            } else {
                this.tail = node;
            }
            this.head = node;
            if(this._circular) {
                this.tail.next = this.head;
                this.head.prev = this.tail;
            }
            this._size++;
            return node;
        };
        LinkedList.prototype.prependNode = function (x) {
            if(vs.D.debug) {
                vs.D.assert(x.getList() == this, "Node is not managed by this list");
            }
            x.next = this.head;
            if(this._valid(this.head)) {
                this.head.prev = x;
            } else {
                this.tail = x;
            }
            this.head = x;
            if(this._circular) {
                this.tail.next = this.head;
                this.head.prev = this.tail;
            }
            this._size++;
        };
        LinkedList.prototype.insertAfter = function (node, x) {
            if(vs.D.debug) {
                if(this.maxSize !== -1) {
                    vs.D.assert(this.size() < this.maxSize, "size equals maxSize " + this.maxSize);
                }
                vs.D.assert(this._valid(node), "Node is null");
                vs.D.assert(node.getList() == this, "Node is not managed by this list");
            }
            var t = this._getNode(x);
            this.__insertAfter(node, t);
            if(node == this.tail) {
                this.tail = t;
                if(this._circular) {
                    this.tail.next = this.head;
                }
            }
            this._size++;
            return t;
        };
        LinkedList.prototype.insertBefore = function (node, x) {
            if(vs.D.debug) {
                if(this.maxSize !== -1) {
                    vs.D.assert(this.size() < this.maxSize, "size equals maxSize " + this.maxSize);
                }
                vs.D.assert(this._valid(node), "Node is null");
                vs.D.assert(node.getList() == this, "Node is not managed by this list");
            }
            var t = this._getNode(x);
            this.__insertBefore(node, t);
            if(node == this.head) {
                this.head = t;
                if(this._circular) {
                    this.head.prev = this.tail;
                }
            }
            this._size++;
            return t;
        };
        LinkedList.prototype.unlink = function (node) {
            if(vs.D.debug) {
                vs.D.assert(this._size > 0, "the list is empty");
                vs.D.assert(this._valid(node), "Node is null");
                vs.D.assert(node.getList() == this, "Node is not managed by this list");
            }
            var hook = node.next;
            if(node == this.head) {
                this.head = this.head.next;
                if(this._circular) {
                    if(this.head == this.tail) {
                        this.head = null;
                    } else {
                        this.tail.next = this.head;
                    }
                }
                if(this.head == null) {
                    this.tail = null;
                }
            } else {
                if(node == this.tail) {
                    this.tail = this.tail.prev;
                    if(this._circular) {
                        this.head.prev = this.tail;
                    }
                    if(this.tail == null) {
                        this.head = null;
                    }
                }
            }
            this.__unlink(node);
            this._putNode(node);
            this._size--;
            return hook;
        };
        LinkedList.prototype.getNodeAt = function (i) {
            if(vs.D.debug) {
                vs.D.assert(this._size > 0, "list is empty");
                vs.D.assert(i >= 0 && i < this._size, "index is out of range");
            }
            var node = this.head;
            for(var j = 0; j < i; j++) {
                node = node.next;
            }
            return node;
        };
        LinkedList.prototype.removeHead = function () {
            if(vs.D.debug) {
                vs.D.assert(this._size > 0, "list is empty");
            }
            var node = this.head;
            if(this.head == this.tail) {
                this.head = this.tail = null;
            } else {
                this.head = this.head.next;
                node.next = null;
                if(this._circular) {
                    this.head.prev = this.tail;
                    this.tail.next = this.head;
                } else {
                    this.head.prev = null;
                }
            }
            this._size--;
            return this._putNode(node);
        };
        LinkedList.prototype.removeTail = function () {
            if(vs.D.debug) {
                vs.D.assert(this._size > 0, 'list is empty');
            }
            var node = this.tail;
            if(this.head == this.tail) {
                this.head = this.tail = null;
            } else {
                this.tail = this.tail.prev;
                node.prev = null;
                if(this._circular) {
                    this.tail.next = this.head;
                    this.head.prev = this.tail;
                } else {
                    this.tail.next = null;
                }
            }
            this._size--;
            return this._putNode(node);
        };
        LinkedList.prototype.shiftUp = function () {
            if(vs.D.debug) {
                vs.D.assert(this._size > 0, 'list is empty');
            }
            if(this._size > 1) {
                var t = this.head;
                if(this.head.next == this.tail) {
                    this.head = this.tail;
                    this.head.prev = null;
                    this.tail = t;
                    this.tail.next = null;
                    this.head.next = this.tail;
                    this.tail.prev = this.head;
                } else {
                    this.head = this.head.next;
                    this.head.prev = null;
                    this.tail.next = t;
                    t.next = null;
                    t.prev = this.tail;
                    this.tail = t;
                }
                if(this._circular) {
                    this.tail.next = this.head;
                    this.head.prev = this.tail;
                }
            }
        };
        LinkedList.prototype.popHead = function () {
            var val = this.head.val;
            this.removeHead();
            return val;
        };
        LinkedList.prototype.popTail = function () {
            var val = this.tail.val;
            this.removeTail();
            return val;
        };
        LinkedList.prototype.popDown = function () {
            if(vs.D.debug) {
                vs.D.assert(this._size > 0, 'list is empty');
            }
            if(this._size > 1) {
                var t = this.tail;
                if(this.tail.prev == this.head) {
                    this.tail = this.head;
                    this.tail.next = null;
                    this.head = t;
                    this.head.prev = null;
                    this.head.next = this.tail;
                    this.tail.prev = this.head;
                } else {
                    this.tail = this.tail.prev;
                    this.tail.next = null;
                    this.head.prev = t;
                    t.prev = null;
                    t.next = this.head;
                    this.head = t;
                }
                if(this._circular) {
                    this.tail.next = this.head;
                    this.head.prev = this.tail;
                }
            }
        };
        LinkedList.prototype.nodeOf = function (x, from) {
            if (typeof from === "undefined") { from = null; }
            if(vs.D.debug) {
                if(this._valid(from)) {
                    vs.D.assert(from.getList() == this, 'node is not managed by this list');
                }
            }
            var node = (from == null) ? this.head : from;
            if(this._circular) {
                while(node != this.tail) {
                    if(node.val == x) {
                        return node;
                    }
                    node = node.next;
                }
                if(node.val == x) {
                    return node;
                }
            } else {
                while(this._valid(node)) {
                    if(node.val == x) {
                        return node;
                    }
                    node = node.next;
                }
            }
            return null;
        };
        LinkedList.prototype.lastNodeOf = function (x, from) {
            if (typeof from === "undefined") { from = null; }
            if(vs.D.debug) {
                if(this._valid(from)) {
                    vs.D.assert(from.getList() == this, 'node is not managed by this list');
                }
            }
            var node = (from == null) ? this.tail : from;
            if(this._circular) {
                while(node != this.head) {
                    if(node.val == x) {
                        return node;
                    }
                    node = node.prev;
                }
                if(node.val == x) {
                    return node;
                }
            } else {
                while(this._valid(node)) {
                    if(node.val == x) {
                        return node;
                    }
                    node = node.prev;
                }
            }
            return null;
        };
        LinkedList.prototype.sort = function (compare, useInsertionSort) {
            if (typeof useInsertionSort === "undefined") { useInsertionSort = false; }
            if(this._size > 1) {
                if(this._circular) {
                    this.tail.next = null;
                    this.head.prev = null;
                }
                if(compare !== null) {
                    this.head = useInsertionSort ? this._insertionSort(this.head, compare) : this._mergeSort(this.head, compare);
                }
                if(this._circular) {
                    this.tail.next = this.head;
                    this.head.prev = this.tail;
                }
            }
        };
        LinkedList.prototype.merge = function (x) {
            if(vs.D.debug) {
                if(this.maxSize != -1) {
                    vs.D.assert(this.size() + x.size() <= this.maxSize, 'size equals max size ' + this.maxSize);
                }
                vs.D.assert(x != this, 'x equals this list');
                vs.D.assert(x != null, 'x is null');
            }
            if(this._valid(x.head)) {
                var node = x.head;
                for(var i = 0; i < x.size(); i++) {
                    this.__list(node, this);
                    node = node.next;
                }
                if(this._valid(this.head)) {
                    this.tail.next = x.head;
                    x.head.prev = this.tail;
                    this.tail = x.tail;
                } else {
                    this.head = x.head;
                    this.tail = x.tail;
                }
                this._size += x.size();
                if(this._circular) {
                    this.tail.next = this.head;
                    this.head.prev = this.tail;
                }
            }
        };
        LinkedList.prototype.concat = function (x) {
            if(vs.D.debug) {
                vs.D.assert(x != null, 'x is null');
                vs.D.assert(x != this, 'x equals this list');
            }
            var c = new LinkedList();
            var k = x.size();
            if(k > 0) {
                var node = x.tail;
                var t = c.tail = new Node(node.val, c);
                node = node.prev;
                var i = k - 1;
                while(i-- > 0) {
                    var copy = new Node(node.val, c);
                    copy.next = t;
                    t.prev = copy;
                    t = copy;
                    node = node.prev;
                }
                c.head = t;
                c._size = k;
                if(this._size > 0) {
                    var node = this.tail;
                    var i = this._size;
                    while(i-- > 0) {
                        var copy = new Node(node.val, c);
                        copy.next = t;
                        t.prev = copy;
                        t = copy;
                        node = node.prev;
                    }
                    c.head = t;
                    c._size += this._size;
                }
            } else {
                if(this._size > 0) {
                    var node = this.tail;
                    var t = c.tail = new Node(node.val, this);
                    node = node.prev;
                    var i = this._size - 1;
                    while(i-- > 0) {
                        var copy = new Node(node.val, this);
                        copy.next = t;
                        t.prev = copy;
                        t = copy;
                        node = node.prev;
                    }
                    c.head = t;
                    c._size = this._size;
                }
            }
            return c;
        };
        LinkedList.prototype.reverse = function () {
            if(this._size <= 1) {
                return;
            } else {
                if(this._size <= 3) {
                    var t = this.head.val;
                    this.head.val = this.tail.val;
                    this.tail.val = t;
                } else {
                    var head = this.head;
                    var tail = this.tail;
                    for(var i = 0; i < (this._size >> 1); i++) {
                        var t = head.val;
                        head.val = tail.val;
                        tail.val = t;
                        head = head.next;
                        tail = tail.prev;
                    }
                }
            }
        };
        LinkedList.prototype.free = function () {
            var node = this.head;
            for(var i = 0; i < this._size; i++) {
                var next = node.next;
                node.next = node.prev = null;
                node.val = null;
                node = next;
            }
            this.head = this.tail = null;
            var node = this._headPool;
            while(this._valid(node)) {
                var next = node.next;
                node.next = null;
                node.val = null;
                node = next;
            }
            this._headPool = this._tailPool = null;
            this._iterator = null;
        };
        LinkedList.prototype.contains = function (x) {
            var node = this.head;
            for(var i = 0; i < this._size; i++) {
                if(node.val == x) {
                    return true;
                }
                node = node.next;
            }
            return false;
        };
        LinkedList.prototype.containsSolid = function (x) {
            var node = this.head;
            for(var i = 0; i < this._size; i++) {
                if(node.val.affector.solid == true) {
                    return true;
                }
                node = node.next;
            }
            return false;
        };
        LinkedList.prototype.remove = function (x) {
            var s = this.size();
            if(s == 0) {
                return false;
            }
            var node = this.head;
            while(this._valid(node)) {
                if(node.val == x) {
                    node = this.unlink(node);
                } else {
                    node = node.next;
                }
            }
            return this.size() < s;
        };
        LinkedList.prototype.clear = function (purge) {
            if (typeof purge === "undefined") { purge = false; }
            if(purge || this._reservedSize > 0) {
                var node = this.head;
                for(var i = 0; i < this._size; i++) {
                    var next = node.next;
                    node.prev = null;
                    node.next = null;
                    this._putNode(node);
                    node = next;
                }
            }
            this.head = this.tail = null;
            this._size = 0;
        };
        LinkedList.prototype.iterator = function () {
            if(this.reuseIterator) {
                if(this._iterator == null) {
                    if(this._circular) {
                        return new CircularDLLIterator(this);
                    } else {
                        return new DLLIterator(this);
                    }
                } else {
                    this._iterator.reset();
                }
                return this._iterator;
            } else {
                if(this._circular) {
                    return new CircularDLLIterator(this);
                } else {
                    return new DLLIterator(this);
                }
            }
        };
        LinkedList.prototype._mergeSort = function (node, cmp) {
            var h = node;
            var p, q, e, tail = null;
            var insize = 1;
            var nmerges, psize, qsize, i;
            while(true) {
                p = h;
                h = tail = null;
                nmerges = 0;
                while(this._valid(p)) {
                    nmerges++;
                    psize = 0;
                    q = p;
                    for(var i = 0; i < insize; i++) {
                        psize++;
                        q = q.next;
                        if(q == null) {
                            break;
                        }
                    }
                    qsize = insize;
                    while(psize > 0 || (qsize > 0 && this._valid(q))) {
                        if(psize == 0) {
                            e = q;
                            q = q.next;
                            qsize--;
                        } else {
                            if(qsize == 0 || q == null) {
                                e = p;
                                p = p.next;
                                psize--;
                            } else {
                                if(cmp(q.val, p.val) >= 0) {
                                    e = p;
                                    p = p.next;
                                    psize--;
                                } else {
                                    e = q;
                                    q = q.next;
                                    qsize--;
                                }
                            }
                        }
                        if(this._valid(tail)) {
                            tail.next = e;
                        } else {
                            h = e;
                        }
                        e.prev = tail;
                        tail = e;
                    }
                    p = q;
                }
                tail.next = null;
                if(nmerges <= 1) {
                    break;
                }
                insize <<= 1;
            }
            h.prev = null;
            this.tail = tail;
            return h;
        };
        LinkedList.prototype._insertionSort = function (node, cmp) {
            var h = node;
            var n = h.next;
            while(this._valid(n)) {
                var m = n.next;
                var p = n.prev;
                var v = n.val;
                if(cmp(v, p.val) < 0) {
                    var i = p;
                    while(i.hasPrev()) {
                        if(cmp(v, i.prev.val) < 0) {
                            i = i.prev;
                        } else {
                            break;
                        }
                    }
                    if(this._valid(m)) {
                        p.next = m;
                        m.prev = p;
                    } else {
                        p.next = null;
                        this.tail = p;
                    }
                    if(i == h) {
                        n.prev = null;
                        n.next = i;
                        i.prev = n;
                        h = n;
                    } else {
                        n.prev = i.prev;
                        i.prev.next = n;
                        n.next = i;
                        i.prev = n;
                    }
                }
                n = m;
            }
            return h;
        };
        LinkedList.prototype.__insertAfter = function (node, x) {
            node._insertAfter(x);
        };
        LinkedList.prototype.__insertBefore = function (node, x) {
            node._insertBefore(x);
        };
        LinkedList.prototype.__unlink = function (node) {
            return node._unlink();
        };
        LinkedList.prototype._getNode = function (x) {
            if(this._reservedSize == 0 || this._poolSize == 0) {
                return new Node(x, this);
            } else {
                var n = this._headPool;
                if(vs.D.debug) {
                    vs.D.assert(n.prev == null, 'node.prev == null');
                    vs.D.assert(this._valid(n.next), 'node.next != null');
                }
                this._headPool = this._headPool.next;
                this._poolSize--;
                n.next = null;
                n.val = x;
                return n;
            }
        };
        LinkedList.prototype._putNode = function (x) {
            var val = x.val;
            if(this._reservedSize > 0 && this._poolSize < this._reservedSize) {
                this._tailPool = this._tailPool.next = x;
                x.val = null;
                if(vs.D.debug) {
                    vs.D.assert(x.next == null, "x.next == null");
                    vs.D.assert(x.prev == null, "x.prev == null");
                }
                this._poolSize++;
            } else {
                this.__list(x, null);
            }
            return val;
        };
        LinkedList.prototype.__list = function (node, x) {
            node._list = x;
        };
        LinkedList.prototype.size = function () {
            return this._size;
        };
        LinkedList.prototype.print = function () {
            console.log(this.toString());
        };
        LinkedList.prototype.toArray = function () {
            var a = [];
            var node = this.head;
            for(var i = 0; i < this._size; i++) {
                a.push(node.val);
                node = node.next;
            }
            return a;
        };
        LinkedList.prototype.removeNode = function (node) {
            this._size--;
            return this.__unlink(node);
        };
        LinkedList.prototype.toString = function () {
            var s = "LinkedList - Size: " + this.size() + " Circular: " + this.isCircular();
            if(this.isEmpty()) {
                return s;
            }
            s += "\n|< head";
            var node = this.head;
            for(var i = 0; i < this._size; i++) {
                s += " " + node.val;
                node = node.next;
            }
            s += " tail >|";
            return s;
        };
        LinkedList.prototype.forEach = function (callback) {
            var node = this.head;
            var i = 0;
            while(this._valid(node)) {
                callback(node.val, i, node);
                node = node.next;
                i++;
            }
        };
        LinkedList.prototype.isEmpty = function () {
            return this._size == 0;
        };
        LinkedList.prototype._valid = function (node) {
            if(node == undefined) {
                return false;
            }
            return (node != null);
        };
        return LinkedList;
    })();
    vs.LinkedList = LinkedList;    
    var DLLIterator = (function () {
        function DLLIterator(f) {
            this._f = f;
            this.reset();
        }
        DLLIterator.prototype.reset = function () {
            this._walker = this._f.head;
            this._hook = null;
            return this;
        };
        DLLIterator.prototype.hasNext = function () {
            if(this._walker == undefined) {
                return false;
            }
            return this._walker != null;
        };
        DLLIterator.prototype.next = function () {
            var x = this._walker.val;
            this._hook = this._walker;
            this._walker = this._walker.next;
            return x;
        };
        DLLIterator.prototype.remove = function () {
            if(vs.D.debug) {
                vs.D.assert(this._hook != null, 'call next() before removing an element');
            }
            this._f.unlink(this._hook);
        };
        return DLLIterator;
    })();    
    var CircularDLLIterator = (function () {
        function CircularDLLIterator(f) {
            this._f = f;
            this.reset();
        }
        CircularDLLIterator.prototype.reset = function () {
            this._walker = this._f.head;
            this._s = this._f.size();
            this._i = 0;
            this._hook = null;
            return this;
        };
        CircularDLLIterator.prototype.hasNext = function () {
            return this._i < this._s;
        };
        CircularDLLIterator.prototype.next = function () {
            var x = this._walker.val;
            this._hook = this._walker;
            this._walker = this._walker.next;
            this._i++;
            return x;
        };
        CircularDLLIterator.prototype.remove = function () {
            if(vs.D.debug) {
                vs.D.assert(this._i > 0, 'call next() before removing an element');
            }
            this._f.unlink(this._hook);
            this._i--;
            this._s--;
        };
        return CircularDLLIterator;
    })();    
    var Test = (function () {
        function Test() { }
        Test.testList = function testList() {
            console.log("Testing LinkedList...");
            console.log("Debug: " + vs.D.debug);
            var list = new LinkedList();
            var x = 100;
            for(var i = 0; i < x; i++) {
                list.append(Math.floor(Math.random() * 100));
            }
            list.print();
            console.log("Sorting...");
            var compare = function (a, b) {
                if(a < b) {
                    return -1;
                }
                if(a > b) {
                    return 1;
                }
                return 0;
            };
            list.sort(compare, true);
            list.sort(compare, true);
            list.print();
            console.log("reversing..");
            list.reverse();
            list.print();
            var n = list.getNodeAt(0);
            list.insertBefore(n, 7);
            list.print();
            n = list.getNodeAt(list.size() - 1);
            list.insertAfter(n, 300);
            list.print();
            var list2 = new LinkedList();
            list2.addAll([
                4, 
                5, 
                10, 
                7, 
                20, 
                30, 
                40
            ]);
            list2.print();
            var itr = list2.iterator();
            while(itr.hasNext()) {
                var val = itr.next();
                console.log(val);
            }
        }
        return Test;
    })();
    vs.Test = Test;    
})(vs || (vs = {}));
