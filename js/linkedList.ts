/// <reference path="debug.ts" />
/// <reference path="interfaces.ts" />

module vs {
    export class Node {
        val: any;
        next: Node;
        prev: Node;
        _list: LinkedList;

        constructor (val:any, list:LinkedList) {
            this.val = val;
            this._list = list;
        }

        // Destroys the object
        free() {
            this.val = null;
            this.next = this.prev = null;
            this._list = null;
        }
        
        // Returns true if node is head
        isHead() {
            return this == this._list.head;
        }

        isTail() {
            return this == this._list.tail;
        }

        hasNext() {
            if (this.next == undefined) return false;
            return this.next !== null;
        }

        hasPrev() {
            if (this.prev == undefined) return false;
            return this.prev !== null;
        }

        // Returns element of the next node
        nextVal() {
            D.assert(this.hasNext(), "Next node is null");

            return this.next.val;
        }

        prevVal() {
            D.assert(this.hasPrev(), "Prev node is null");

            return this.prev.val;
        }

        getList() {
            return this._list;
        }

        // this unlinks the node from the list and returns it
        unlink() {
            D.assert(this._list !== null, "List is null");

            return this._list.unlink(this);
        }

        prepend(node: Node) {
            D.assert(node !== null, 'node is null');
		    D.assert(this.prev == null, 'prev is not null');
		    D.assert(this._list == null && node._list == null, 'node is managed by a list');

		    node.next = this;
		    this.prev = node;
		    return node;
        }

        append(node: Node) {
            D.assert(node !== null, 'node is null');
		    D.assert(this.next == null, 'next is not null');
		    D.assert(this._list == null && node._list == null, 'node is managed by a list');
            
            this.next = node;
		    node.prev = this;
		    return node;
        }

        toString() {
            return String(this.val);
        }

        _unlink() {
            var t = this.next;
		    if (this.hasPrev()) this.prev.next = this.next;
		    if (this.hasNext()) this.next.prev = this.prev;
		    this.next = this.prev = null;
		    return t;
        }

        _insertAfter(node:Node) {
            node.next = this.next;
            node.prev = this;
            if (this.hasNext()) this.next.prev = node;
            this.next = node;
        }

        _insertBefore(node: Node) {
            node.next = this;
            node.prev = this.prev;
            if (this.hasPrev()) {
                this.prev.next = node;
            }
            this.prev = node;
        }

    }

    export class LinkedList {

        // A unique identifier for this object.
        // A hash table transforms this key into an index of an array element by using a hash function.
        // This value should never be changed by the user.
        key: number;

        // The head of this list or null if this list is empty. 
        head: Node;

        // The tail of this list or null if this list is empty. 
        tail: Node;

        // The maximum allowed size of this list.
        // Once the maximum size is reached, adding an element will fail with an error (debug only).
        // A value of -1 indicates that the size is unbound.
        // Always equals -1 in release mode.
        maxSize: number;

        // If true, reuses the iterator object instead of allocating a new one when calling <code>iterator()
        // The default is false.
        // If true, nested iterations are likely to fail as only one iteration is allowed at a time.
        reuseIterator: bool;

        private _size: number;
        private _reservedSize: number;
        private _poolSize: number;

        private _headPool: Node;
        private _tailPool: Node;

        private _circular: bool;
        private _iterator: Iterator;

        constructor (reservedSize?: number, maxSize?: number = -1) {
            if (D.debug) {
                if (reservedSize > 0) {
                    if (maxSize !== -1) {
                        D.assert((reservedSize <= maxSize), "Reserved size is larger than max size.");
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

            if (reservedSize > 0) {
                this._headPool = this._tailPool = new Node(null, this);
            }

            this.head = this.tail = null;
            this.key = HashKey.next();
            this.reuseIterator = false;
	    }

        // Returns true if this list is circular.
        // A list is circular if the tail points to the head and vice versa.
        isCircular() {
            return this._circular;
        }

        // Makes this list circular by connecting the tail to the head and vice versa.
        // Silently fails if this list is already closed.
        close() {
            if(this._circular) return;
            this._circular = true;
            if (this._valid(this.head)) {
                this.tail.next = this.head;
                this.head.prev = this.tail;
            }
        
        }

        // Makes this list non-circular by disconnecting the tail from the head and vice versa.
        // Silently fails if this list is already non-circular.
        open() {
            if (!this._circular) return;
		    this._circular = false;
		    if (this._valid(this.head))
		    {
			    this.tail.next = null;
			    this.head.prev = null;
		    }
        }

        // Creates and returns a new DLLNode object storing the value x and pointing to this list.
        createNode(x:any) {
            return new Node(x, this);
        }

        // same as append but returns a list instead of a node
        add(x: any) {
            this.append(x);
            return this;
        }

        // Appends the contents of the array to the list
        addAll(x:any[]) {
            x.forEach((val, i, a) =>{
                this.append(val);
            });
            return this;
        }

        // Appends the element x to the tail of this list by creating a Node object storing x
        // returns: the appended node storing x.
        append(x: any) {
            if (D.debug) {
                if(this.maxSize != -1)
                    D.assert(this.size() < this.maxSize, ("size equals max size " + this.maxSize));
            }

            var node = this._getNode(x);

            if (this._valid(this.tail)) {
                this.tail.next = node;
                node.prev = this.tail;
            } else {
                this.head = node;
            }
            this.tail = node;

            if (this._circular) {
                this.tail.next = this.head;
                this.head.prev = this.tail;
            }

            this._size++;
            return node;
        }

        // Appends a node x to the list
        appendNode(x: Node) {
            if (D.debug) {
                D.assert(x.getList() == this, "Node is not managed by this list");
            }

            if (this._valid(this.tail)) {
                this.tail.next = x;
                x.prev = this.tail;
            }
            else {
                this.head = x;
            }
            this.tail = x;

            if (this._circular)
		    {
			    this.tail.next = this.head;
			    this.head.prev = this.tail;
		    }
		
		    this._size++;
        }

        // Prepends the element to the head of the list
        prepend(x: any) {
            if (D.debug) {
                if(this.maxSize !== -1)
                    D.assert(this.size() < this.maxSize, "size equals max size " + this.maxSize);
            }

            var node = this._getNode(x);
            node.next = this.head;
            if (this._valid(this.head)) {
                this.head.prev = node;
            } else {
                this.tail = node;
            }
            this.head = node;

            if (this._circular) {
                this.tail.next = this.head;
                this.head.prev = this.tail;
            }

            this._size++; 
            return node;
        }

        // Prepends a node x to the head
        prependNode(x: Node) {
            if (D.debug) {
                D.assert(x.getList() == this, "Node is not managed by this list");
            }

            x.next = this.head;
            if (this._valid(this.head)) {
                this.head.prev = x;
            } else {
                this.tail = x;
            }
            this.head = x;

            if (this._circular) {
                this.tail.next = this.head;
                this.head.prev = this.tail;
            }

            this._size++;
        }

        // Inserts x after node node
        insertAfter(node: Node, x: any) {
            if (D.debug) {
                if(this.maxSize !== -1)
                    D.assert(this.size() < this.maxSize, "size equals maxSize " + this.maxSize);
                D.assert(this._valid(node), "Node is null");
                D.assert(node.getList() == this, "Node is not managed by this list");
            }

            var t = this._getNode(x);
            this.__insertAfter(node, t);
            if (node == this.tail) {
                this.tail = t;
                if (this._circular) {
                    this.tail.next = this.head;
                }
            }

            this._size++;
            return t;
        }

        insertBefore(node: Node, x: any) {
            if (D.debug) {
                if(this.maxSize !== -1)
                    D.assert(this.size() < this.maxSize, "size equals maxSize " + this.maxSize);
                D.assert(this._valid(node), "Node is null");
                D.assert(node.getList() == this, "Node is not managed by this list");
            }

            var t = this._getNode(x);
            this.__insertBefore(node, t);
            if (node == this.head) {
                this.head = t;
                if (this._circular) {
                    this.head.prev = this.tail;
                }
            }

            this._size++;
            return t;
        }

        // Unlinks and returns the next node
        unlink(node: Node) {
            if (D.debug) {
                D.assert(this._size > 0, "the list is empty");
                D.assert(this._valid(node), "Node is null");
                D.assert(node.getList() == this, "Node is not managed by this list");
            }

            var hook = node.next;
            if (node == this.head) {
                this.head = this.head.next;
                if (this._circular) {
                    if (this.head == this.tail) {
                        this.head = null;
                    } else {
                        this.tail.next = this.head;
                    }
                }

                if (this.head == null) this.tail = null;
            }
            else if (node == this.tail) {
                this.tail = this.tail.prev;
                if(this._circular)
                    this.head.prev = this.tail;

                if (this.tail == null) this.head = null;
            }

            this.__unlink(node);
            this._putNode(node);
            this._size--;

            return hook;
        }

        // gets the node at the index
        getNodeAt(i: number) {
            if (D.debug) {
                D.assert(this._size > 0, "list is empty");
                D.assert(i >= 0 && i < this._size, "index is out of range");
            }

            var node = this.head;
            for (var j = 0; j < i; j++) {
                node = node.next;
            }
            return node;
        }

        removeHead() {
            if (D.debug) {
                D.assert(this._size > 0, "list is empty");
            }

		    var node = this.head;
		    if (this.head == this.tail)
			    this.head = this.tail = null;
		    else
		    {
			    this.head = this.head.next;
			    node.next = null;
			
			    if (this._circular)
			    {
				    this.head.prev = this.tail;
				    this.tail.next = this.head;
			    }
			    else
				    this.head.prev = null;
		    }
		    this._size--;
		
		    return this._putNode(node);
	    }

        removeTail()
	    {
            if (D.debug) {
                D.assert(this._size > 0, 'list is empty');
            }
		
		    var node = this.tail;
		    if (this.head == this.tail)
			    this.head = this.tail = null;
		    else
		    {
			    this.tail = this.tail.prev;
			    node.prev = null;
			
			    if (this._circular)
			    {
				    this.tail.next = this.head;
				    this.head.prev = this.tail;
			    }
			    else
				    this.tail.next = null;
		    }
		
		    this._size--;
		
		    return this._putNode(node);
	    }

        // Unlinks the head node and appends it to the tail.
        shiftUp()
	    {
            if (D.debug) {
                D.assert(this._size > 0, 'list is empty');
            }
		
		    if (this._size > 1)
		    {
			    var t = this.head;
			    if (this.head.next == this.tail)
			    {
				    this.head = this.tail;
				    this.head.prev = null;
				
				    this.tail = t;
				    this.tail.next = null;
				
				    this.head.next = this.tail;
				    this.tail.prev = this.head;
			    }
			    else
			    {
				    this.head = this.head.next;
				    this.head.prev = null;
				
				    this.tail.next = t;
				
				    t.next = null;
				    t.prev = this.tail;
				
				    this.tail = t;
			    }
			
			    if (this._circular)
			    {
				    this.tail.next = this.head;
				    this.head.prev = this.tail;
			    }
		    }
	    }

        popHead(): any {
            var val = this.head.val;
            this.removeHead();
            return val;
        }

        popTail(): any {
            var val = this.tail.val;
            this.removeTail();
            return val;
        }

        // Unlinks the tail node and prepends it to the head.
        popDown()
	    {
            if (D.debug) {
                D.assert(this._size > 0, 'list is empty');
            }
		
		    if (this._size > 1)
		    {
			    var t = this.tail;
			    if (this.tail.prev == this.head)
			    {
				    this.tail = this.head;
				    this.tail.next = null;
				
				    this.head = t;
				    this.head.prev = null;
				
				    this.head.next = this.tail;
				    this.tail.prev = this.head;
			    }
			    else
			    {
				    this.tail = this.tail.prev;
				    this.tail.next = null;
				
				    this.head.prev = t;
				
				    t.prev = null;
				    t.next = this.head;
				
				    this.head = t;
			    }
			
			    if (this._circular)
			    {
				    this.tail.next = this.head;
				    this.head.prev = this.tail;
			    }
		    }
	    }

        /**
	     * Searches for the element <code>x</code> in this list from head to tail starting at node <code>from</code>.
	     * <o>n</o>
	     * @return the node containing <code>x</code> or null if such a node does not exist.<br/>
	     * If <code>from</code> is null, the search starts at the head of this list.
	     * @throws de.polygonal.AssertError <code>from</code> is not managed by this list (debug only).
	     */
        nodeOf(x: any, from: Node = null)
	    {
		    if(D.debug) {
                if (this._valid(from))
                    D.assert(from.getList() == this, 'node is not managed by this list');
            }
		
		    var node = (from == null) ? this.head : from;
		    if (this._circular)
		    {
			    while (node != this.tail)
			    {
				    if (node.val == x) return node;
				    node = node.next;
			    }
			    if (node.val == x) return node;
		    }
		    else
		    {
			    while (this._valid(node))
			    {
				    if (node.val == x) return node;
				    node = node.next;
			    }
		    }
		    return null;
	    }

        /**
	     * Searches for the element <code>x</code> in this list from tail to head starting at node <code>from</code>.
	     * <o>n</o>
	     * @return the node containing <code>x</code> or null if such a node does not exist.<br/>
	     * If <code>from</code> is null, the search starts at the tail of this list.
	     * @throws de.polygonal.AssertError <code>from</code> is not managed by this list (debug only).
	     */
	    lastNodeOf(x:any, from:Node = null)
	    {
	        if (D.debug) {
	            if (this._valid(from))
	                D.assert(from.getList() == this, 'node is not managed by this list');
	        }
		
		    var node = (from == null) ? this.tail : from;
		    if (this._circular)
		    {
			    while (node != this.head)
			    {
				    if (node.val == x) return node;
				    node = node.prev;
			    }
			    if (node.val == x) return node;
		    }
		    else
		    {
			    while (this._valid(node))
			    {
				    if (node.val == x) return node;
				    node = node.prev;
			    }
		    }
		    return null;
	    }

        /**
	     * Sorts the elements of this list using the merge sort algorithm.
	     * <o>n log n for merge sort and n&sup2; for insertion sort</o>
	     * @param compare a comparison function.<br/>
	     * If null, the elements are compared using element.<em>compare()</em>.<br/>
	     * <warn>In this case all elements have to implement <em>Comparable</em>.</warn>
	     * @param useInsertionSort if true, the linked list is sorted using the insertion sort algorithm.
	     * This is faster for nearly sorted lists.
	     * @throws de.polygonal.AssertError element does not implement <em>Comparable</em> (debug only).
	     */
	    sort(compare: { (a: any, b: any): number; }, useInsertionSort:bool = false)
	    {
		    if (this._size > 1)
		    {
			    if (this._circular)
			    {
				    this.tail.next = null;
				    this.head.prev = null;
			    }
			
			    //if (compare !== null)
			    //{
				//    this.head = useInsertionSort ? this._insertionSortComparable(this.head) : this._mergeSortComparable(this.head);
			    //}
			    //else
			    //{
				//    this.head = useInsertionSort ? this._insertionSort(this.head, compare) : this._mergeSort(this.head, compare);
			    //}

			    if (compare !== null) {
                    this.head = useInsertionSort ? this._insertionSort(this.head, compare) : this._mergeSort(this.head, compare);
			    }
			
			    if (this._circular)
			    {
				    this.tail.next = this.head;
				    this.head.prev = this.tail;
			    }
		    }
	    }

        /**
	     * Merges this list with the list <code>x</code> by linking both lists together.<br/>
	     * <warn>The merge operation destroys x so it should be discarded.</warn>
	     * <o>n</o>
	     * @throws de.polygonal.AssertError <code>x</code> is null or this list equals <code>x</code> (debug only).
	     */
	    merge(x:LinkedList)
	    {
	        if (D.debug) {
	            if (this.maxSize != -1)
	                D.assert(this.size() + x.size() <= this.maxSize, 'size equals max size ' + this.maxSize);
	            D.assert(x != this, 'x equals this list');
	            D.assert(x != null, 'x is null');
	        }
		
		    if (this._valid(x.head))
		    {
			    var node = x.head;
			    for (var i = 0; i < x.size(); i++)
			    {
				    this.__list(node, this);
				    node = node.next;
			    }
				
			    if (this._valid(this.head))
			    {
				    this.tail.next = x.head;
				    x.head.prev = this.tail;
				    this.tail = x.tail;
			    }
			    else
			    {
				    this.head = x.head;
				    this.tail = x.tail;
			    }
			
			    this._size += x.size();
			
			    if (this._circular)
			    {
				    this.tail.next = this.head;
				    this.head.prev = this.tail;
			    }
		    }
	    }

        /**
	     * Concatenates this list with the list <code>x</code> by appending all elements of <code>x</code> to this list.<br/>
	     * This list and <code>x</code> are untouched.
	     * <o>n</o>
	     * @return a new list containing the elements of both lists.
	     * @throws de.polygonal.AssertError <code>x</code> is null or this equals <code>x</code> (debug only).
	     */
	    concat(x:any)
	    {
	        if (D.debug) {
	            D.assert(x != null, 'x is null');
	            D.assert(x != this, 'x equals this list');
	        }
		
	        var c = new LinkedList();
		    var k = x.size();
		    if (k > 0)
		    {
			    var node = x.tail;
			    var t = c.tail = new Node(node.val, c);
			    node = node.prev;
			    var i = k - 1;
			    while (i-- > 0)
			    {
				    var copy = new Node(node.val, c);
				    copy.next = t;
				    t.prev = copy;
				    t = copy;
				    node = node.prev;
			    }
			
			    c.head = t;
			    c._size = k;
			
			    if (this._size > 0)
			    {
				    var node = this.tail;
				    var i = this._size;
				    while (i-- > 0)
				    {
					    var copy = new Node(node.val, c);
					    copy.next = t;
					    t.prev = copy;
					    t = copy;
					    node = node.prev;
				    }
				    c.head = t;
				    c._size += this._size;
			    }
		    }
		    else
		    if (this._size > 0)
		    {
			    var node = this.tail;
			    var t = c.tail = new Node(node.val, this);
			    node = node.prev;
			    var i = this._size - 1;
			    while (i-- > 0)
			    {
				    var copy = new Node(node.val, this);
				    copy.next = t;
				    t.prev = copy;
				    t = copy;
				    node = node.prev;
			    }
			
			    c.head = t;
			    c._size = this._size;
		    }
		
		    return c;
	    }

        /**
	     * Reverses the linked list in place.
	     * <o>n</o>
	     */
	    reverse()
	    {
		    if (this._size <= 1)
			    return;
		    else
		    if (this._size <= 3)
		    {
			    var t = this.head.val;
			    this.head.val = this.tail.val;
			    this.tail.val = t;
		    }
		    else
		    {
			    var head = this.head;
			    var tail = this.tail;

			    for (var i = 0; i < (this._size >> 1); i++) {
                    var t = head.val;
			        head.val = tail.val;
			        tail.val = t;
			        head = head.next;
			        tail = tail.prev;
                }
			    //for (i in 0..._size >> 1)
			    //{
				//    var t = this.head.val;
				//    this.head.val = this.tail.val;
				//    this.tail.val = t;
				
				//    this.head = this.head.next;
				//    this.tail = this.tail.prev;
			    //}
		    }
	    }
	

        //_mergeSortComparable(node:Node)
	    //{
		//    var h = node;

        //    // Should tail be local or global?
		//    var p, q, e, tail = null;
		//    var insize = 1;
		//    var nmerges, psize, qsize, i;
		
		//    while (true)
		//    {
		//	    p = h;
		//	    h = tail = null;
		//	    nmerges = 0;
			
		//	    while (this._valid(p))
		//	    {
		//		    nmerges++;
				
		//		    psize = 0; q = p;
		//		    for (var 1 = 0; i < insize; i++)
		//		    {
		//			    psize++;
		//			    q = q.next;
		//			    if (q == null) break;
		//		    }
				
		//		    qsize = insize;
				
		//		    while (psize > 0 || (qsize > 0 && this._valid(q)))
		//		    {
		//			    if (psize == 0)
		//			    {
		//				    e = q; q = q.next; qsize--;
		//			    }
		//			    else
		//			    if (qsize == 0 || q == null)
		//			    {
		//				    e = p; p = p.next; psize--;
		//			    }
		//			    else
		//			    {
		//			        if (D.debug) {
		//			            D.assert(Std.is(p.val, Comparable), Sprintf.format('element is not of type Comparable (%s)', [p.val]));
		//			        }
						
		//				    if (cast(p.val, Comparable<Dynamic>).compare(q.val) >= 0)
		//				    {
		//					    e = p; p = p.next; psize--;
		//				    }
		//				    else
		//				    {
		//					    e = q; q = q.next; qsize--;
		//				    }
		//			    }
					
		//			    if (this._valid(tail))
		//				    tail.next = e;
		//			    else
		//				    h = e;
					
		//			    e.prev = tail;
		//			    tail = e;
		//		    }
		//		    p = q;
		//	    }
			
		//	    tail.next = null;
		//	    if (nmerges <= 1) break;
		//	    insize <<= 1;
		//    }
		
		//    h.prev = null;
		//    this.tail = tail;
		
		//    return h;
	    //}

        /**
	     * Destroys this object by explicitly nullifying all nodes, pointers and data for GC'ing used resources.<br/>
	     * Improves GC efficiency/performance (optional).
	     * <o>n</o>
	     */
	    free()
	    {
		    var node = this.head;
		    for (var i = 0; i < this._size; i++)
		    {
			    var next = node.next;
			    node.next = node.prev = null;
			    node.val = null;
			    node = next;
		    }
		    this.head = this.tail = null;
		
		    var node = this._headPool;
		    while (this._valid(node))
		    {
			    var next = node.next;
			    node.next = null;
			    node.val = null;
			    node = next;
		    }
		
		    this._headPool = this._tailPool = null;
		    this._iterator = null;
	    }

        /**
	     * Returns true if this list contains a node storing the element <code>x</code>.
	     * <o>n</o>
	     */
	    contains(x:any)
	    {
		    var node = this.head;
		    for (var i = 0; i < this._size; i++)
		    {
			    if (node.val == x)
				    return true;
			    node = node.next;
		    }
		    return false;
	    }

        containsSolid(x:any):bool
	    {
		    var node = this.head;
		    for (var i = 0; i < this._size; i++)
		    {
			    if (node.val.affector.solid == true)
				    return true;
			    node = node.next;
		    }
		    return false;
	    }

        /**
	     * Removes all nodes storing the element <code>x</code>.
	     * <o>n</o>
	     * @return true if at least one occurrence of <code>x</code> was removed.
	     */
	    remove(x:any)
	    {
		    var s = this.size();
		    if (s == 0) return false;
		
		    var node = this.head;
		    while (this._valid(node))
		    {
			    if (node.val == x)
				    node = this.unlink(node);
			    else
				    node = node.next;
		    }
		
		    return this.size() < s;
	    }

        /**
	     * Removes all elements.
	     * <o>1 or n if <code>purge</code> is true</o>
	     * @param purge if true, nodes, pointers and elements are nullified upon removal.
	     */
	    clear(purge?:bool = false)
	    {
		    if (purge || this._reservedSize > 0)
		    {
			    var node = this.head;
			    for (var i = 0; i < this._size; i++)
			    {
				    var next = node.next;
				    node.prev = null;
				    node.next = null;
				    this._putNode(node);
				    node = next;
			    }
		    }
		
		    this.head = this.tail = null;
		    this._size = 0;
	    }

        /**
	     * Returns a new <em>DLLIterator</em> object to iterate over all elements contained in this doubly linked list.<br/>
	     * Uses a <em>CircularDLLIterator</em> iterator object if <em>circular</em> is true. 
	     * The elements are visited from head to tail.<br/>
	     * If performance is crucial, use the following loop instead:<br/><br/>
	     * <pre class="prettyprint">
	     * //open list:
	     * var node = myDLL.head;
	     * while (node != null)
	     * {
	     *     var element = node.val;
	     *     node = node.next;
	     * }
	     * 
	     * //circular list:
	     * var node = myDLL.head;
	     * for (i in 0...list.size())
	     * {
	     *     var element = node.val;
	     *     node = node.next;
	     * }
	     * </pre>
	     * @see <a href="http://haxe.org/ref/iterators" target="_blank">http://haxe.org/ref/iterators</a>
	     * 
	     */
	    iterator():Iterator
	    {
		    if (this.reuseIterator)
		    {
			    if (this._iterator == null)
			    {
				    if (this._circular)
					    return new CircularDLLIterator(this);
				    else
					    return new DLLIterator(this);
			    }
			    else
				    this._iterator.reset();
			    return this._iterator;
		    }
		    else
		    {
			    if (this._circular)
				    return new CircularDLLIterator(this);
			    else
				    return new DLLIterator(this);
		    }
	    }
	
        _mergeSort(node: Node, cmp: { (a:any, b:any): number; })
	    {
		    var h = node;
		    var p, q, e, tail = null;
		    var insize = 1;
		    var nmerges, psize, qsize, i;
		
		    while (true)
		    {
			    p = h;
			    h = tail = null;
			    nmerges = 0;
			
			    while (this._valid(p))
			    {
				    nmerges++;
				
				    psize = 0; q = p;
				    for (var i = 0; i < insize; i++)
				    {
					    psize++;
					    q = q.next;
					    if (q == null) break;
				    }
				
				    qsize = insize;
				
				    while (psize > 0 || (qsize > 0 && this._valid(q)))
				    {
					    if (psize == 0)
					    {
						    e = q; q = q.next; qsize--;
					    }
					    else
					    if (qsize == 0 || q == null)
					    {
						    e = p; p = p.next; psize--;
					    }
					    else
					    if (cmp(q.val, p.val) >= 0)
					    {
						    e = p; p = p.next; psize--;
					    }
					    else
					    {
						    e = q; q = q.next; qsize--;
					    }
					
					    if (this._valid(tail))
						    tail.next = e;
					    else
						    h = e;
					
					    e.prev = tail;
					    tail = e;
				    }
				    p = q;
			    }
			
			    tail.next = null;
			    if (nmerges <= 1) break;
			    insize <<= 1;
		    }
		
		    h.prev = null;
		    this.tail = tail;
		
		    return h;
	    }
	
	    //_insertionSortComparable(node:Node)
	    //{
		//    var h = node;
		//    var n = h.next;
		//    while (this._valid(n))
		//    {
		//	    var m = n.next;
		//	    var p = n.prev;
		//	    var v = n.val;
			
		//	    //if (D.debug) {
		//	    //    D.assert(Std.is(p.val, Comparable), Sprintf.format('element is not of type Comparable (%s)', [p.val]));
		//	    //}
			
		//	    if (this.cast(p.val, Comparable<Dynamic>).compare(v) < 0)
		//	    {
		//		    var i = p;
				
		//		    while (i.hasPrev())
		//		    {
		//			    #if debug
		//			    D.assert(Std.is(i.prev.val, Comparable), Sprintf.format('element is not of type Comparable (%s)', [i.prev.val]));
		//			    #end
					
		//			    if (cast(i.prev.val, Comparable<Dynamic>).compare(v) < 0)
		//				    i = i.prev;
		//			    else
		//				    break;
		//		    }
		//		    if (_valid(m))
		//		    {
		//			    p.next = m;
		//			    m.prev = p;
		//		    }
		//		    else
		//		    {
		//			    p.next = null;
		//			    tail = p;
		//		    }
				
		//		    if (i == h)
		//		    {
		//			    n.prev = null;
		//			    n.next = i;
					
		//			    i.prev = n;
		//			    h = n;
		//		    }
		//		    else
		//		    {
		//			    n.prev = i.prev;
		//			    i.prev.next = n;
					
		//			    n.next = i;
		//			    i.prev = n;
		//		    }
		//	    }
		//	    n = m;
		//    }
		
		//    return h;
	    //}
	
        _insertionSort(node: Node, cmp: { (a: any, b: any): number; })
	    {
		    var h = node;
		    var n = h.next;
		    while (this._valid(n))
		    {
			    var m = n.next;
			    var p = n.prev;
			    var v = n.val;
			
			    if (cmp(v, p.val) < 0)
			    {
				    var i = p;
				
				    while (i.hasPrev())
				    {
					    if (cmp(v, i.prev.val) < 0)
						    i = i.prev;
					    else
						    break;
				    }
				    if (this._valid(m))
				    {
					    p.next = m;
					    m.prev = p;
				    }
				    else
				    {
					    p.next = null;
					    this.tail = p;
				    }
				
				    if (i == h)
				    {
					    n.prev = null;
					    n.next = i;
					
					    i.prev = n;
					    h = n;
				    }
				    else
				    {
					    n.prev = i.prev;
					    i.prev.next = n;
					
					    n.next = i;
					    i.prev = n;
				    }
			    }
			    n = m;
		    }
		
		    return h;
	    }

        __insertAfter(node:Node, x:Node) {
            node._insertAfter(x);
        }

        __insertBefore(node:Node, x:Node) {
            node._insertBefore(x);
        }

        __unlink(node: Node) {
            return node._unlink();
        }



        _getNode(x: any) {
            if (this._reservedSize == 0 || this._poolSize == 0)
			return new Node(x, this);
		    else
		    {
			    var n = this._headPool;
			
			    if (D.debug) {
			        D.assert(n.prev == null, 'node.prev == null');
			        D.assert(this._valid(n.next), 'node.next != null');
			    }
			
			    this._headPool = this._headPool.next;
			    this._poolSize--;
			
			    n.next = null;
			    n.val = x;
			    return n;
		    }
            //return new Node(x, this);
        }

        _putNode(x:Node) {
            var val = x.val;
            if (this._reservedSize > 0 && this._poolSize < this._reservedSize) {
                this._tailPool = this._tailPool.next = x;
                x.val = null;

                if (D.debug) {
                    D.assert(x.next == null, "x.next == null");
                    D.assert(x.prev == null, "x.prev == null");
                }

                this._poolSize++;
            }
            else {
                this.__list(x, null);
            }

            return val;
        }

        __list(node:Node, x:LinkedList) {
            node._list = x;
        }

        

        size() {
            return this._size;
        }

        print() {
            console.log(this.toString());
        }

        toArray(): any[] {
            var a:any = [];
		    var node = this.head;
		    for (var i = 0; i < this._size; i++)
		    {
		        a.push(node.val);
			    node = node.next;
		    }
		    return a;
        }

        removeNode(node:Node) {
            this._size--;
            return this.__unlink(node);
        }

        toString() {
            var s = "LinkedList - Size: " + this.size() + " Circular: " + this.isCircular();
            if(this.isEmpty())
                return s;

            s += "\n|< head";
            var node = this.head;
            for (var i = 0; i < this._size; i++) {
                s += " " + node.val;
                node = node.next;
            }
            s += " tail >|";
            return s;
        }

        forEach(callback: { (value: any, index: number, node: Node): void; }) {
            //var node = this.head;
            //for (var i = 0; i < this._size; i++) {
            //    calback(node.val, i, node);
            //    node = node.next;
            //}
            //var itr = this.iterator();
            //var val;
            //while (itr.hasNext()) {
            //    next = itr.next();
            //    callback(
                
            //}

            var node = this.head;
            var i: number = 0;
            
            while (this._valid(node)) {
                callback(node.val, i, node);
                node = node.next;
                i++;
            }

        }

        isEmpty() {
            return this._size == 0;
        }

        _valid(node: Node) {
            if (node == undefined) return false;
            return (node != null);
        }
    }

    class DLLIterator implements Iterator {
        _f:LinkedList;
	    _walker:Node;
	    _hook:Node;
	
	    constructor(f:LinkedList)
	    {
		    this._f = f;
		    this.reset();
	    }
	
	    reset():Iterator
	    {
		    this._walker = this._f.head;
		    this._hook = null;
		    return this;
	    }
	
	    hasNext():bool
	    {
	        if (this._walker == undefined) return false;
		    return this._walker != null;
	    }

	    next():any
	    {
		    var x = this._walker.val;
		    this._hook = this._walker;
		    this._walker = this._walker.next;
		    return x;
	    }
	
	    remove(): void {
	        if (D.debug) {
	            D.assert(this._hook != null, 'call next() before removing an element');
	        }
		
		    this._f.unlink(this._hook);
	    }
    }

    class CircularDLLIterator implements Iterator {
        _f:LinkedList;
	    _walker:Node;
	    _i:number;
	    _s:number;
	    _hook:Node;
	
	    constructor(f:LinkedList)
	    {
		    this._f = f;
		    this.reset();
	    }
	
	    reset():Iterator
	    {
		    this._walker = this._f.head;
		    this._s = this._f.size();
		    this._i = 0;
		    this._hook = null;
		    return this;
	    }
	
	    hasNext():bool
	    {
		    return this._i < this._s;
	    }

	    next():any
	    {
		    var x = this._walker.val;
		    this._hook = this._walker;
		    this._walker = this._walker.next;
		    this._i++;
		    return x;
	    }
	
	    remove():void
	    {
	        if (D.debug) {
	            D.assert(this._i > 0, 'call next() before removing an element');
	        }
		    this._f.unlink(this._hook);
		    this._i--;
		    this._s--;
	    }
        
    }

    export class Test {
        static testList() {
            console.log("Testing LinkedList...");
            console.log("Debug: " + D.debug);
            var list = new LinkedList();
            //var n = list.append("hello");
            

            //list.insertAfter(list.prepend("goodbye"), "MyLove");

            //list.insertBefore(n, "Howdy");

            //n = list.prepend("Begin");

            // list.insertBefore(n, "Wah");

            // list.insertAfter(n, "end");

            var x = 100;
            for (var i = 0; i < x; i++) {
                list.append(Math.floor(Math.random() * 100));
            }
            list.print();

            console.log("Sorting...");
            var compare = (a: any, b: any) {
                if(a < b) return -1;
                if(a > b) return 1;
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
            list2.addAll([4, 5, 10, 7, 20, 30, 40]);
            list2.print();

            var itr = list2.iterator();
            while (itr.hasNext()) {
                var val = itr.next();
                console.log(val);
            }

            //list2.forEach((val, i) =>{
            //    console.log(val);
            //});

            //var list3 = list2.concat(list);
            
            //list3.print();
            //list2.print();
            //list.print();


            //var n = list.getNodeAt(5);
            //console.log("getNodeAt(5) = " + n.val);

            //n = list.getNodeAt(0);
            //console.log("getNodeAt(0) = " + n.val);

            //n = list.getNodeAt(list.size() - 1);
            //console.log("getNodeAt(size-1) = " + n.val);

            //console.log("Removing Head..");
            //list.removeHead();
            //console.log(list.toString());

            //console.log("Removing tail...");
            //list.removeTail();
            //console.log(list.toString());

        }
    }
}