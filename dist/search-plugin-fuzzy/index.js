/*! cat-says-no v0.0.0 |  */
'use strict';
(() => {
    function _(e) {
        return Array.isArray ? Array.isArray(e) : dt(e) === '[object Array]';
    }
    var Ct = 1 / 0;
    function mt(e) {
        if (typeof e == 'string') return e;
        let t = e + '';
        return t == '0' && 1 / e == -Ct ? '-0' : t;
    }
    function Dt(e) {
        return e == null ? '' : mt(e);
    }
    function B(e) {
        return typeof e == 'string';
    }
    function lt(e) {
        return typeof e == 'number';
    }
    function Bt(e) {
        return e === !0 || e === !1 || (Ft(e) && dt(e) == '[object Boolean]');
    }
    function ft(e) {
        return typeof e == 'object';
    }
    function Ft(e) {
        return ft(e) && e !== null;
    }
    function E(e) {
        return e != null;
    }
    function H(e) {
        return !e.trim().length;
    }
    function dt(e) {
        return e == null ? (e === void 0 ? '[object Undefined]' : '[object Null]') : Object.prototype.toString.call(e);
    }
    var Mt = "Incorrect 'index' type",
        _t = (e) => `Invalid value for key ${e}`,
        yt = (e) => `Pattern length exceeds max of ${e}.`,
        It = (e) => `Missing ${e} property in key`,
        St = (e) => `Property 'weight' in key '${e}' must be a positive integer`,
        ut = Object.prototype.hasOwnProperty,
        z = class {
            constructor(t) {
                (this._keys = []), (this._keyMap = {});
                let s = 0;
                t.forEach((r) => {
                    let n = gt(r);
                    this._keys.push(n), (this._keyMap[n.id] = n), (s += n.weight);
                }),
                    this._keys.forEach((r) => {
                        r.weight /= s;
                    });
            }
            get(t) {
                return this._keyMap[t];
            }
            keys() {
                return this._keys;
            }
            toJSON() {
                return JSON.stringify(this._keys);
            }
        };
    function gt(e) {
        let t = null,
            s = null,
            r = null,
            n = 1,
            i = null;
        if (B(e) || _(e)) (r = e), (t = ct(e)), (s = V(e));
        else {
            if (!ut.call(e, 'name')) throw new Error(It('name'));
            let u = e.name;
            if (((r = u), ut.call(e, 'weight') && ((n = e.weight), n <= 0))) throw new Error(St(u));
            (t = ct(u)), (s = V(u)), (i = e.getFn);
        }
        return { path: t, id: s, weight: n, src: r, getFn: i };
    }
    function ct(e) {
        return _(e) ? e : e.split('.');
    }
    function V(e) {
        return _(e) ? e.join('.') : e;
    }
    function wt(e, t) {
        let s = [],
            r = !1,
            n = (i, u, c) => {
                if (E(i))
                    if (!u[c]) s.push(i);
                    else {
                        let o = u[c],
                            h = i[o];
                        if (!E(h)) return;
                        if (c === u.length - 1 && (B(h) || lt(h) || Bt(h))) s.push(Dt(h));
                        else if (_(h)) {
                            r = !0;
                            for (let a = 0, f = h.length; a < f; a += 1) n(h[a], u, c + 1);
                        } else u.length && n(h, u, c + 1);
                    }
            };
        return n(e, B(t) ? t.split('.') : t, 0), r ? s : s[0];
    }
    var Lt = { includeMatches: !1, findAllMatches: !1, minMatchCharLength: 1 },
        Rt = {
            isCaseSensitive: !1,
            ignoreDiacritics: !1,
            includeScore: !1,
            keys: [],
            shouldSort: !0,
            sortFn: (e, t) => (e.score === t.score ? (e.idx < t.idx ? -1 : 1) : e.score < t.score ? -1 : 1),
        },
        xt = { location: 0, threshold: 0.6, distance: 100 },
        bt = { useExtendedSearch: !1, getFn: wt, ignoreLocation: !1, ignoreFieldNorm: !1, fieldNormWeight: 1 },
        l = { ...Rt, ...Lt, ...xt, ...bt },
        Nt = /[^ ]+/g;
    function kt(e = 1, t = 3) {
        let s = new Map(),
            r = Math.pow(10, t);
        return {
            get(n) {
                let i = n.match(Nt).length;
                if (s.has(i)) return s.get(i);
                let u = 1 / Math.pow(i, 0.5 * e),
                    c = parseFloat(Math.round(u * r) / r);
                return s.set(i, c), c;
            },
            clear() {
                s.clear();
            },
        };
    }
    var N = class {
        constructor({ getFn: t = l.getFn, fieldNormWeight: s = l.fieldNormWeight } = {}) {
            (this.norm = kt(s, 3)), (this.getFn = t), (this.isCreated = !1), this.setIndexRecords();
        }
        setSources(t = []) {
            this.docs = t;
        }
        setIndexRecords(t = []) {
            this.records = t;
        }
        setKeys(t = []) {
            (this.keys = t),
                (this._keysMap = {}),
                t.forEach((s, r) => {
                    this._keysMap[s.id] = r;
                });
        }
        create() {
            this.isCreated ||
                !this.docs.length ||
                ((this.isCreated = !0),
                B(this.docs[0])
                    ? this.docs.forEach((t, s) => {
                          this._addString(t, s);
                      })
                    : this.docs.forEach((t, s) => {
                          this._addObject(t, s);
                      }),
                this.norm.clear());
        }
        add(t) {
            let s = this.size();
            B(t) ? this._addString(t, s) : this._addObject(t, s);
        }
        removeAt(t) {
            this.records.splice(t, 1);
            for (let s = t, r = this.size(); s < r; s += 1) this.records[s].i -= 1;
        }
        getValueForItemAtKeyId(t, s) {
            return t[this._keysMap[s]];
        }
        size() {
            return this.records.length;
        }
        _addString(t, s) {
            if (!E(t) || H(t)) return;
            let r = { v: t, i: s, n: this.norm.get(t) };
            this.records.push(r);
        }
        _addObject(t, s) {
            let r = { i: s, $: {} };
            this.keys.forEach((n, i) => {
                let u = n.getFn ? n.getFn(t) : this.getFn(t, n.path);
                if (E(u)) {
                    if (_(u)) {
                        let c = [],
                            o = [{ nestedArrIndex: -1, value: u }];
                        for (; o.length; ) {
                            let { nestedArrIndex: h, value: a } = o.pop();
                            if (E(a))
                                if (B(a) && !H(a)) {
                                    let f = { v: a, i: h, n: this.norm.get(a) };
                                    c.push(f);
                                } else
                                    _(a) &&
                                        a.forEach((f, d) => {
                                            o.push({ nestedArrIndex: d, value: f });
                                        });
                        }
                        r.$[i] = c;
                    } else if (B(u) && !H(u)) {
                        let c = { v: u, n: this.norm.get(u) };
                        r.$[i] = c;
                    }
                }
            }),
                this.records.push(r);
        }
        toJSON() {
            return { keys: this.keys, records: this.records };
        }
    };
    function At(e, t, { getFn: s = l.getFn, fieldNormWeight: r = l.fieldNormWeight } = {}) {
        let n = new N({ getFn: s, fieldNormWeight: r });
        return n.setKeys(e.map(gt)), n.setSources(t), n.create(), n;
    }
    function Ot(e, { getFn: t = l.getFn, fieldNormWeight: s = l.fieldNormWeight } = {}) {
        let { keys: r, records: n } = e,
            i = new N({ getFn: t, fieldNormWeight: s });
        return i.setKeys(r), i.setIndexRecords(n), i;
    }
    function O(e, { errors: t = 0, currentLocation: s = 0, expectedLocation: r = 0, distance: n = l.distance, ignoreLocation: i = l.ignoreLocation } = {}) {
        let u = t / e.length;
        if (i) return u;
        let c = Math.abs(r - s);
        return n ? u + c / n : c ? 1 : u;
    }
    function $t(e = [], t = l.minMatchCharLength) {
        let s = [],
            r = -1,
            n = -1,
            i = 0;
        for (let u = e.length; i < u; i += 1) {
            let c = e[i];
            c && r === -1 ? (r = i) : !c && r !== -1 && ((n = i - 1), n - r + 1 >= t && s.push([r, n]), (r = -1));
        }
        return e[i - 1] && i - r >= t && s.push([r, i - 1]), s;
    }
    var R = 32;
    function Tt(
        e,
        t,
        s,
        {
            location: r = l.location,
            distance: n = l.distance,
            threshold: i = l.threshold,
            findAllMatches: u = l.findAllMatches,
            minMatchCharLength: c = l.minMatchCharLength,
            includeMatches: o = l.includeMatches,
            ignoreLocation: h = l.ignoreLocation,
        } = {},
    ) {
        if (t.length > R) throw new Error(yt(R));
        let a = t.length,
            f = e.length,
            d = Math.max(0, Math.min(r, f)),
            g = i,
            A = d,
            p = c > 1 || o,
            m = p ? Array(f) : [],
            I;
        for (; (I = e.indexOf(t, A)) > -1; ) {
            let C = O(t, { currentLocation: I, expectedLocation: d, distance: n, ignoreLocation: h });
            if (((g = Math.min(C, g)), (A = I + a), p)) {
                let S = 0;
                for (; S < a; ) (m[I + S] = 1), (S += 1);
            }
        }
        A = -1;
        let M = [],
            x = 1,
            L = a + f,
            Et = 1 << (a - 1);
        for (let C = 0; C < a; C += 1) {
            let S = 0,
                w = L;
            for (; S < w; )
                O(t, { errors: C, currentLocation: d + w, expectedLocation: d, distance: n, ignoreLocation: h }) <= g ? (S = w) : (L = w),
                    (w = Math.floor((L - S) / 2 + S));
            L = w;
            let nt = Math.max(1, d - w + 1),
                W = u ? f : Math.min(d + w, f) + a,
                b = Array(W + 2);
            b[W + 1] = (1 << C) - 1;
            for (let D = W; D >= nt; D -= 1) {
                let k = D - 1,
                    it = s[e.charAt(k)];
                if (
                    (p && (m[k] = +!!it),
                    (b[D] = ((b[D + 1] << 1) | 1) & it),
                    C && (b[D] |= ((M[D + 1] | M[D]) << 1) | 1 | M[D + 1]),
                    b[D] & Et && ((x = O(t, { errors: C, currentLocation: k, expectedLocation: d, distance: n, ignoreLocation: h })), x <= g))
                ) {
                    if (((g = x), (A = k), A <= d)) break;
                    nt = Math.max(1, 2 * d - A);
                }
            }
            if (O(t, { errors: C + 1, currentLocation: d, expectedLocation: d, distance: n, ignoreLocation: h }) > g) break;
            M = b;
        }
        let K = { isMatch: A >= 0, score: Math.max(0.001, x) };
        if (p) {
            let C = $t(m, c);
            C.length ? o && (K.indices = C) : (K.isMatch = !1);
        }
        return K;
    }
    function vt(e) {
        let t = {};
        for (let s = 0, r = e.length; s < r; s += 1) {
            let n = e.charAt(s);
            t[n] = (t[n] || 0) | (1 << (r - s - 1));
        }
        return t;
    }
    var $ = String.prototype.normalize
            ? (e) =>
                  e
                      .normalize('NFD')
                      .replace(
                          /[\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D3-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u09FE\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0AFA-\u0AFF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C04\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D00-\u0D03\u0D3B\u0D3C\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u1885\u1886\u18A9\u1920-\u192B\u1930-\u193B\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B04\u1B34-\u1B44\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF7-\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u20D0-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F-\uA672\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F]/g,
                          '',
                      )
            : (e) => e,
        T = class {
            constructor(
                t,
                {
                    location: s = l.location,
                    threshold: r = l.threshold,
                    distance: n = l.distance,
                    includeMatches: i = l.includeMatches,
                    findAllMatches: u = l.findAllMatches,
                    minMatchCharLength: c = l.minMatchCharLength,
                    isCaseSensitive: o = l.isCaseSensitive,
                    ignoreDiacritics: h = l.ignoreDiacritics,
                    ignoreLocation: a = l.ignoreLocation,
                } = {},
            ) {
                if (
                    ((this.options = {
                        location: s,
                        threshold: r,
                        distance: n,
                        includeMatches: i,
                        findAllMatches: u,
                        minMatchCharLength: c,
                        isCaseSensitive: o,
                        ignoreDiacritics: h,
                        ignoreLocation: a,
                    }),
                    (t = o ? t : t.toLowerCase()),
                    (t = h ? $(t) : t),
                    (this.pattern = t),
                    (this.chunks = []),
                    !this.pattern.length)
                )
                    return;
                let f = (g, A) => {
                        this.chunks.push({ pattern: g, alphabet: vt(g), startIndex: A });
                    },
                    d = this.pattern.length;
                if (d > R) {
                    let g = 0,
                        A = d % R,
                        p = d - A;
                    for (; g < p; ) f(this.pattern.substr(g, R), g), (g += R);
                    if (A) {
                        let m = d - R;
                        f(this.pattern.substr(m), m);
                    }
                } else f(this.pattern, 0);
            }
            searchIn(t) {
                let { isCaseSensitive: s, ignoreDiacritics: r, includeMatches: n } = this.options;
                if (((t = s ? t : t.toLowerCase()), (t = r ? $(t) : t), this.pattern === t)) {
                    let p = { isMatch: !0, score: 0 };
                    return n && (p.indices = [[0, t.length - 1]]), p;
                }
                let { location: i, distance: u, threshold: c, findAllMatches: o, minMatchCharLength: h, ignoreLocation: a } = this.options,
                    f = [],
                    d = 0,
                    g = !1;
                this.chunks.forEach(({ pattern: p, alphabet: m, startIndex: I }) => {
                    let {
                        isMatch: M,
                        score: x,
                        indices: L,
                    } = Tt(t, p, m, {
                        location: i + I,
                        distance: u,
                        threshold: c,
                        findAllMatches: o,
                        minMatchCharLength: h,
                        includeMatches: n,
                        ignoreLocation: a,
                    });
                    M && (g = !0), (d += x), M && L && (f = [...f, ...L]);
                });
                let A = { isMatch: g, score: g ? d / this.chunks.length : 1 };
                return g && n && (A.indices = f), A;
            }
        },
        F = class {
            constructor(t) {
                this.pattern = t;
            }
            static isMultiMatch(t) {
                return ot(t, this.multiRegex);
            }
            static isSingleMatch(t) {
                return ot(t, this.singleRegex);
            }
            search() {}
        };
    function ot(e, t) {
        let s = e.match(t);
        return s ? s[1] : null;
    }
    var Y = class extends F {
            constructor(t) {
                super(t);
            }
            static get type() {
                return 'exact';
            }
            static get multiRegex() {
                return /^="(.*)"$/;
            }
            static get singleRegex() {
                return /^=(.*)$/;
            }
            search(t) {
                let s = t === this.pattern;
                return { isMatch: s, score: s ? 0 : 1, indices: [0, this.pattern.length - 1] };
            }
        },
        G = class extends F {
            constructor(t) {
                super(t);
            }
            static get type() {
                return 'inverse-exact';
            }
            static get multiRegex() {
                return /^!"(.*)"$/;
            }
            static get singleRegex() {
                return /^!(.*)$/;
            }
            search(t) {
                let r = t.indexOf(this.pattern) === -1;
                return { isMatch: r, score: r ? 0 : 1, indices: [0, t.length - 1] };
            }
        },
        U = class extends F {
            constructor(t) {
                super(t);
            }
            static get type() {
                return 'prefix-exact';
            }
            static get multiRegex() {
                return /^\^"(.*)"$/;
            }
            static get singleRegex() {
                return /^\^(.*)$/;
            }
            search(t) {
                let s = t.startsWith(this.pattern);
                return { isMatch: s, score: s ? 0 : 1, indices: [0, this.pattern.length - 1] };
            }
        },
        Q = class extends F {
            constructor(t) {
                super(t);
            }
            static get type() {
                return 'inverse-prefix-exact';
            }
            static get multiRegex() {
                return /^!\^"(.*)"$/;
            }
            static get singleRegex() {
                return /^!\^(.*)$/;
            }
            search(t) {
                let s = !t.startsWith(this.pattern);
                return { isMatch: s, score: s ? 0 : 1, indices: [0, t.length - 1] };
            }
        },
        X = class extends F {
            constructor(t) {
                super(t);
            }
            static get type() {
                return 'suffix-exact';
            }
            static get multiRegex() {
                return /^"(.*)"\$$/;
            }
            static get singleRegex() {
                return /^(.*)\$$/;
            }
            search(t) {
                let s = t.endsWith(this.pattern);
                return { isMatch: s, score: s ? 0 : 1, indices: [t.length - this.pattern.length, t.length - 1] };
            }
        },
        J = class extends F {
            constructor(t) {
                super(t);
            }
            static get type() {
                return 'inverse-suffix-exact';
            }
            static get multiRegex() {
                return /^!"(.*)"\$$/;
            }
            static get singleRegex() {
                return /^!(.*)\$$/;
            }
            search(t) {
                let s = !t.endsWith(this.pattern);
                return { isMatch: s, score: s ? 0 : 1, indices: [0, t.length - 1] };
            }
        },
        v = class extends F {
            constructor(
                t,
                {
                    location: s = l.location,
                    threshold: r = l.threshold,
                    distance: n = l.distance,
                    includeMatches: i = l.includeMatches,
                    findAllMatches: u = l.findAllMatches,
                    minMatchCharLength: c = l.minMatchCharLength,
                    isCaseSensitive: o = l.isCaseSensitive,
                    ignoreDiacritics: h = l.ignoreDiacritics,
                    ignoreLocation: a = l.ignoreLocation,
                } = {},
            ) {
                super(t),
                    (this._bitapSearch = new T(t, {
                        location: s,
                        threshold: r,
                        distance: n,
                        includeMatches: i,
                        findAllMatches: u,
                        minMatchCharLength: c,
                        isCaseSensitive: o,
                        ignoreDiacritics: h,
                        ignoreLocation: a,
                    }));
            }
            static get type() {
                return 'fuzzy';
            }
            static get multiRegex() {
                return /^"(.*)"$/;
            }
            static get singleRegex() {
                return /^(.*)$/;
            }
            search(t) {
                return this._bitapSearch.searchIn(t);
            }
        },
        P = class extends F {
            constructor(t) {
                super(t);
            }
            static get type() {
                return 'include';
            }
            static get multiRegex() {
                return /^'"(.*)"$/;
            }
            static get singleRegex() {
                return /^'(.*)$/;
            }
            search(t) {
                let s = 0,
                    r,
                    n = [],
                    i = this.pattern.length;
                for (; (r = t.indexOf(this.pattern, s)) > -1; ) (s = r + i), n.push([r, s - 1]);
                let u = !!n.length;
                return { isMatch: u, score: u ? 0 : 1, indices: n };
            }
        },
        Z = [Y, P, U, Q, J, X, G, v],
        ht = Z.length,
        Pt = / +(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/,
        jt = '|';
    function Kt(e, t = {}) {
        return e.split(jt).map((s) => {
            let r = s
                    .trim()
                    .split(Pt)
                    .filter((i) => i && !!i.trim()),
                n = [];
            for (let i = 0, u = r.length; i < u; i += 1) {
                let c = r[i],
                    o = !1,
                    h = -1;
                for (; !o && ++h < ht; ) {
                    let a = Z[h],
                        f = a.isMultiMatch(c);
                    f && (n.push(new a(f, t)), (o = !0));
                }
                if (!o)
                    for (h = -1; ++h < ht; ) {
                        let a = Z[h],
                            f = a.isSingleMatch(c);
                        if (f) {
                            n.push(new a(f, t));
                            break;
                        }
                    }
            }
            return n;
        });
    }
    var Wt = new Set([v.type, P.type]),
        q = class {
            constructor(
                t,
                {
                    isCaseSensitive: s = l.isCaseSensitive,
                    ignoreDiacritics: r = l.ignoreDiacritics,
                    includeMatches: n = l.includeMatches,
                    minMatchCharLength: i = l.minMatchCharLength,
                    ignoreLocation: u = l.ignoreLocation,
                    findAllMatches: c = l.findAllMatches,
                    location: o = l.location,
                    threshold: h = l.threshold,
                    distance: a = l.distance,
                } = {},
            ) {
                (this.query = null),
                    (this.options = {
                        isCaseSensitive: s,
                        ignoreDiacritics: r,
                        includeMatches: n,
                        minMatchCharLength: i,
                        findAllMatches: c,
                        ignoreLocation: u,
                        location: o,
                        threshold: h,
                        distance: a,
                    }),
                    (t = s ? t : t.toLowerCase()),
                    (t = r ? $(t) : t),
                    (this.pattern = t),
                    (this.query = Kt(this.pattern, this.options));
            }
            static condition(t, s) {
                return s.useExtendedSearch;
            }
            searchIn(t) {
                let s = this.query;
                if (!s) return { isMatch: !1, score: 1 };
                let { includeMatches: r, isCaseSensitive: n, ignoreDiacritics: i } = this.options;
                (t = n ? t : t.toLowerCase()), (t = i ? $(t) : t);
                let u = 0,
                    c = [],
                    o = 0;
                for (let h = 0, a = s.length; h < a; h += 1) {
                    let f = s[h];
                    (c.length = 0), (u = 0);
                    for (let d = 0, g = f.length; d < g; d += 1) {
                        let A = f[d],
                            { isMatch: p, indices: m, score: I } = A.search(t);
                        if (p) {
                            if (((u += 1), (o += I), r)) {
                                let M = A.constructor.type;
                                Wt.has(M) ? (c = [...c, ...m]) : c.push(m);
                            }
                        } else {
                            (o = 0), (u = 0), (c.length = 0);
                            break;
                        }
                    }
                    if (u) {
                        let d = { isMatch: !0, score: o / u };
                        return r && (d.indices = c), d;
                    }
                }
                return { isMatch: !1, score: 1 };
            }
        },
        tt = [];
    function Ht(...e) {
        tt.push(...e);
    }
    function et(e, t) {
        for (let s = 0, r = tt.length; s < r; s += 1) {
            let n = tt[s];
            if (n.condition(e, t)) return new n(e, t);
        }
        return new T(e, t);
    }
    var j = { AND: '$and', OR: '$or' },
        st = { PATH: '$path', PATTERN: '$val' },
        rt = (e) => !!(e[j.AND] || e[j.OR]),
        zt = (e) => !!e[st.PATH],
        Vt = (e) => !_(e) && ft(e) && !rt(e),
        at = (e) => ({ [j.AND]: Object.keys(e).map((t) => ({ [t]: e[t] })) });
    function pt(e, t, { auto: s = !0 } = {}) {
        let r = (n) => {
            let i = Object.keys(n),
                u = zt(n);
            if (!u && i.length > 1 && !rt(n)) return r(at(n));
            if (Vt(n)) {
                let o = u ? n[st.PATH] : i[0],
                    h = u ? n[st.PATTERN] : n[o];
                if (!B(h)) throw new Error(_t(o));
                let a = { keyId: V(o), pattern: h };
                return s && (a.searcher = et(h, t)), a;
            }
            let c = { children: [], operator: i[0] };
            return (
                i.forEach((o) => {
                    let h = n[o];
                    _(h) &&
                        h.forEach((a) => {
                            c.children.push(r(a));
                        });
                }),
                c
            );
        };
        return rt(e) || (e = at(e)), r(e);
    }
    function Yt(e, { ignoreFieldNorm: t = l.ignoreFieldNorm }) {
        e.forEach((s) => {
            let r = 1;
            s.matches.forEach(({ key: n, norm: i, score: u }) => {
                let c = n ? n.weight : null;
                r *= Math.pow(u === 0 && c ? Number.EPSILON : u, (c || 1) * (t ? 1 : i));
            }),
                (s.score = r);
        });
    }
    function Gt(e, t) {
        let s = e.matches;
        (t.matches = []),
            E(s) &&
                s.forEach((r) => {
                    if (!E(r.indices) || !r.indices.length) return;
                    let { indices: n, value: i } = r,
                        u = { indices: n, value: i };
                    r.key && (u.key = r.key.src), r.idx > -1 && (u.refIndex = r.idx), t.matches.push(u);
                });
    }
    function Ut(e, t) {
        t.score = e.score;
    }
    function Qt(e, t, { includeMatches: s = l.includeMatches, includeScore: r = l.includeScore } = {}) {
        let n = [];
        return (
            s && n.push(Gt),
            r && n.push(Ut),
            e.map((i) => {
                let { idx: u } = i,
                    c = { item: t[u], refIndex: u };
                return (
                    n.length &&
                        n.forEach((o) => {
                            o(i, c);
                        }),
                    c
                );
            })
        );
    }
    var y = class {
        constructor(t, s = {}, r) {
            (this.options = { ...l, ...s }), this.options.useExtendedSearch, (this._keyStore = new z(this.options.keys)), this.setCollection(t, r);
        }
        setCollection(t, s) {
            if (((this._docs = t), s && !(s instanceof N))) throw new Error(Mt);
            this._myIndex = s || At(this.options.keys, this._docs, { getFn: this.options.getFn, fieldNormWeight: this.options.fieldNormWeight });
        }
        add(t) {
            E(t) && (this._docs.push(t), this._myIndex.add(t));
        }
        remove(t = () => !1) {
            let s = [];
            for (let r = 0, n = this._docs.length; r < n; r += 1) {
                let i = this._docs[r];
                t(i, r) && (this.removeAt(r), (r -= 1), (n -= 1), s.push(i));
            }
            return s;
        }
        removeAt(t) {
            this._docs.splice(t, 1), this._myIndex.removeAt(t);
        }
        getIndex() {
            return this._myIndex;
        }
        search(t, { limit: s = -1 } = {}) {
            let { includeMatches: r, includeScore: n, shouldSort: i, sortFn: u, ignoreFieldNorm: c } = this.options,
                o = B(t) ? (B(this._docs[0]) ? this._searchStringList(t) : this._searchObjectList(t)) : this._searchLogical(t);
            return (
                Yt(o, { ignoreFieldNorm: c }), i && o.sort(u), lt(s) && s > -1 && (o = o.slice(0, s)), Qt(o, this._docs, { includeMatches: r, includeScore: n })
            );
        }
        _searchStringList(t) {
            let s = et(t, this.options),
                { records: r } = this._myIndex,
                n = [];
            return (
                r.forEach(({ v: i, i: u, n: c }) => {
                    if (!E(i)) return;
                    let { isMatch: o, score: h, indices: a } = s.searchIn(i);
                    o && n.push({ item: i, idx: u, matches: [{ score: h, value: i, norm: c, indices: a }] });
                }),
                n
            );
        }
        _searchLogical(t) {
            let s = pt(t, this.options),
                r = (c, o, h) => {
                    if (!c.children) {
                        let { keyId: f, searcher: d } = c,
                            g = this._findMatches({ key: this._keyStore.get(f), value: this._myIndex.getValueForItemAtKeyId(o, f), searcher: d });
                        return g && g.length ? [{ idx: h, item: o, matches: g }] : [];
                    }
                    let a = [];
                    for (let f = 0, d = c.children.length; f < d; f += 1) {
                        let g = c.children[f],
                            A = r(g, o, h);
                        if (A.length) a.push(...A);
                        else if (c.operator === j.AND) return [];
                    }
                    return a;
                },
                n = this._myIndex.records,
                i = {},
                u = [];
            return (
                n.forEach(({ $: c, i: o }) => {
                    if (E(c)) {
                        let h = r(s, c, o);
                        h.length &&
                            (i[o] || ((i[o] = { idx: o, item: c, matches: [] }), u.push(i[o])),
                            h.forEach(({ matches: a }) => {
                                i[o].matches.push(...a);
                            }));
                    }
                }),
                u
            );
        }
        _searchObjectList(t) {
            let s = et(t, this.options),
                { keys: r, records: n } = this._myIndex,
                i = [];
            return (
                n.forEach(({ $: u, i: c }) => {
                    if (!E(u)) return;
                    let o = [];
                    r.forEach((h, a) => {
                        o.push(...this._findMatches({ key: h, value: u[a], searcher: s }));
                    }),
                        o.length && i.push({ idx: c, item: u, matches: o });
                }),
                i
            );
        }
        _findMatches({ key: t, value: s, searcher: r }) {
            if (!E(s)) return [];
            let n = [];
            if (_(s))
                s.forEach(({ v: i, i: u, n: c }) => {
                    if (!E(i)) return;
                    let { isMatch: o, score: h, indices: a } = r.searchIn(i);
                    o && n.push({ score: h, key: t, value: i, idx: u, norm: c, indices: a });
                });
            else {
                let { v: i, n: u } = s,
                    { isMatch: c, score: o, indices: h } = r.searchIn(i);
                c && n.push({ score: o, key: t, value: i, norm: u, indices: h });
            }
            return n;
        }
    };
    y.version = '7.1.0';
    y.createIndex = At;
    y.parseIndex = Ot;
    y.config = l;
    y.parseQuery = pt;
    Ht(q);
    var Xt = ({ data: e, metadata: t }) => {
        let s = new y(e, { keys: ['title'], threshold: 0.15 });
        return (t.productName ? s.search(t.productName) : []).map((n) => n.item);
    };
    globalThis.search = Xt;
})();
