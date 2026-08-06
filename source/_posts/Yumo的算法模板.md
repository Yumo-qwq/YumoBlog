---
title: Yumo的算法模板
date: 2025-11-15 18:24:30
tags: 算法竞赛
categories: 算法竞赛
excerpt: 这篇文章收集了一些自己常用的算法模板。
index_img: /img/00.jpg
banner_img: /img/luo8th.png
math: true
---
## int128IO

```cpp
using i128 = __int128;

i128 read() {
    i128 res = 0;
    bool neg = false;
    char scan[1005];
    scanf("%s", scan);
    int i = 0;
    if (scan[0] == '-') {
        neg = true;
        i = 1;
    }
    for (; scan[i]; i++) {
        res = res * 10 + (scan[i] - '0');
    }
    return neg ? -res : res;
}

void print(i128 num) {
    if (num < 0) {
        putchar('-');
        num = -num;
    }
    if (num > 9)
        print(num / 10);
    putchar(num % 10 + '0');
}
```

## 对拍

```python
from subprocess import run
from random import randint

def rand():
    n = randint(1, 20)
    s = str(n) + "\n"
    for _ in range(n):
        s += f"{randint(1, 500)} {randint(1, 10**5)} {randint(1, 10**5)}\n"
    return s

def r(program, _input):
    return run(
        program,
        input = _input,
        capture_output = True,
        text = True
    ).stdout

cnt = 0
while(True):
    _in = rand()

    _out1 = r("./a.exe", _in)
    _out2 = r("./b.exe", _in)

    if(_out1 == _out2):
        cnt += 1
        print(cnt)
    else:
        print(_in)
        print(_out1)
        print(_out2)
        print("\n")
        break
```

## 数学相关

### 手写gcd，lcm

```cpp
int gcd(int a, int b) {
    if(b == 0) return a;
    return gcd(b, a % b);    
}

int lcm(int a, int b) {
    return a / gcd(a, b) * b;
}
```

### 判断质数 $O(\frac{\sqrt{N}}{3})$
```cpp
bool is_prime(int n) {
 	if (n < 2) return false;
 	if (n == 2 || n == 3) return true;
    if (n % 6 != 1 && n % 6 != 5) return false;
    
 	for (int i = 5, j = n / i; i <= j; i += 6) {
 		if (n % i == 0 || n % (i + 2) == 0) {
 			return false;
 		}
 	}
 	return true;
 }
```

### 埃氏筛 - 筛出 $\sqrt N$ 下的素数

```cpp
vector<int> primes;

void sieve(int n) {
    vector<bool> isprime(n + 1, true);
    isprime[0] = isprime[1] = false;
    
    for(int i = 2; i * i <= n; i++) {
        if(isprime[i]) {
            for(int j = i * i; j <= n; j += i) {
                isprime[j] = false;
            }
        }
    }
    for(int i = 2; i <= n; i++) {
        if(isprime[i]) primes.push_back(i);
    }
}
```

### 质因数分解

```cpp
vector<int> ans;
auto factor = [&](int n) -> void {
    vector<int> ans;
    for(int p : primes) {
        if(p * p > n) break;
        while(n % p == 0) {
            ans.push_back(p);
            n /= p;
        }
    }
    if(n > 1) ans.push_back(n);
};  
```

### 欧拉筛

```cpp
const int N = 1e7 + 5;

vector<int> primes;    
int spf[N];

void sieve(int n) {
    for(int i = 2; i <= n; i++) {
        if(!spf[i]) {               
            spf[i] = i;
            primes.push_back(i);
        }
        for(int p : primes) {
            if(p > spf[i] || i * p > n) break;
            spf[i * p] = p;
        }
    }
}
```

### 快速幂

```cpp
int qpow(int a, int b, int p) {
    int res = 1;
    while(b) {
        if(b & 1) res = res * a % p;
        a = a * a % p;
        b >>= 1;	
    }
    return res;
}
```

###  二项式系数 递推

```cpp
C[0][0] = 1;
for(int i = 1; i < n; i++) {
    C[i][0] = C[i][i] = 1;
    for(int j = 1; j < i; j++) {
    	C[i][j] = (C[i-1][j] + C[i-1][j-1]) % MOD;
    }
}
```

### 第一类斯特林数 递推

```cpp
S[0][0] = 1;
for(int i = 1; i <= 50000; i++) {
    if(i < 210) S[i][i] = 1; 
    S[i][0] = 0; 
    for(int j = 1; j < min(200LL, i); j++) {
        S[i][j] = (S[i - 1][j - 1] + ((i - 1) * S[i - 1][j]) % MOD) % MOD;
    }
}
```

### 扩欧

```cpp
i64 exgcd(i64 a, i64 b, i64 &x, i64 &y) {
    if(!b) {
        x = 1;
        y = 0;
        return a;
    }
    i64 x1, y1;
    int k = exgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;
    return k;
}
```

### 中国剩余定理

```cpp
i128 exgcd(i128 a, i128 b, i128 &x, i128 &y) {
    if(!b) {
        x = 1;
        y = 0;
        return a;
    }
    i128 x1, y1;
    i128 gcd = exgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;
    return gcd;
}

i128 inv(i128 a, i128 p) {
    i128 x, y;
    exgcd(a, p, x, y);
    return (x % p + p) % p;
}

void solve() {
    i128 n;
    n = read();
    // x = b(mod a)

    vector<i128> a(n + 1), b(n + 1), m(n + 1), t(n + 1);
    i128 M = 1, ans = 0;

    for(int i = 1; i <= n; i++) a[i] = read(),  b[i] = read();
    for(int i = 1; i <= n; i++) M *= a[i];
    for(int i = 1; i <= n; i++) m[i] = M / a[i];
    for(int i = 1; i <= n; i++) t[i] = inv(m[i], a[i]);

    for(int i = 1; i <= n; i++) ans += (b[i] % M * t[i] % M * m[i] % M);

    print((ans % M + M) % M);
    puts("\n");
}
```

### 1-n 的逆元 递推

```cpp
int qpow(int a, int b, int p) {
    int res = 1;
    while(b) {
        if(b & 1) res = res * a % p;
        a = a * a % p;
        b >>= 1;
    }
    return res;
}

void solve() {
    int n, p;
    cin >> n >> p;
    vector<int> inv(n + 1);
    inv[1] = 1;
    for(int i = 2; i <= n; i++) inv[i] = (p - p / i) * inv[p % i] % p;
    for(int i = 1; i <= n; i++) cout << inv[i] << '\n';   
}
```

### 矩阵快速幂 $O(n^{3}\log_2n)$


```cpp
struct matrix{
    int c[N][N];
    matrix(){memset(c, 0, sizeof(c));}
}A, B;

int m, k, c, x0, n, g;

matrix operator*(matrix &x, matrix &y) {
    matrix t;
    for(int i = 1; i <= 2; i++) {
        for(int j = 1; j <= 2; j++) {
            for(int l = 1; l <= 2; l++) {
                t.c[i][j] = (t.c[i][j] + x.c[i][l] * y.c[l][j] % m) % m;
            }
        }
    }
    return t;
}

matrix mqpow(matrix A, i128 y) {
    matrix B;
    for (int i = 1; i <= 3; i++) B.c[i][i] = 1;

    while (y) {
        if (y & 1) B = B * A;
        A = A * A;
        y >>= 1;
    }
    return B;
}
```

### 求欧拉函数 $O(\sqrt{n})$

```cpp
int phi(int n) {
    int res = n;
    for(int i = 2; i * i <= n; i++) {
        if(n % i == 0) {
            res = res / i * (i - 1);
            while(n % i == 0) n /= i;
        }
    }
    if(n > 1) res = res / n * (n - 1);
    return res;
} 
```

### 递推欧拉函数

```cpp
int phi[N], p[N];
bitset<N> vis;

void pre(int x) {
    phi[1] = 1;
    for(int i = 2; i <= x; i++) {
        if(!vis[i]) {
            p[++p[0]] = i;
            phi[i] = i - 1;
        }
        for(int j = 1; j <= p[0] && 1ll * i * p[j] < x; j++) {
            vis[i * p[j]] = true;
            if(i % p[j] == 0) {
                phi[i * p[j]] = phi[i] * p[j];
                break;
            } else {
                phi[i * p[j]] = phi[i] * (p[j] - 1);
            }
        }
    }
}
```

### 高斯消元

```cpp
const double eps = 1e-16;

int n;
double a[N][N];

int gauss() {  
    int r = 1;
    for(int c = 1; c <= n && r <= n; c++) {
        int tmp = r;
        while(tmp <= n && fabs(a[tmp][c]) < eps) tmp++;
        
        if(tmp > n) continue;
        if(tmp != r) {
            for(int j = c; j <= n + 1; j++) swap(a[tmp][j], a[r][j]);
        }   

        double d = a[r][c];
        for(int j = 1; j <= n + 1; j++) a[r][j] /= d;

        for(int k = 1; k <= n; k++) {
            if(k == r) continue;

            double t = a[k][c];
            for(int j = c; j <= n + 1; j++) a[k][j] -= t * a[r][j];
        }
        r++;
    }

    for(int i = r; i <= n; i++) if(fabs(a[i][n + 1]) > eps) return -1;
    return r - 1 == n;
}

void solve() {
    cin >> n;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n + 1; j++) {
            cin >> a[i][j];
        }
    }
    int res = gauss();
    if(res == -1) cout << "-1\n";
    else if(res == 0) cout << "0\n";
    else {
        for(int i = 1; i <= n; i++) {
            cout << fixed << setprecision(2) << a[i][n+1] << '\n';
        }
    }

```

### 模意义下矩阵求逆

```cpp
const int MOD = 1e9 + 7;
const int N = 800 + 10;

int n;
int a[N][N];

int qpow(int a, int b, int p) {
    int res = 1;
    while(b) {
        if(b & 1) res = res * a % p;
        a = a * a % p;
        b >>= 1;
    }
    return res;
}

int gauss() {
    int r = 1;
    for(int c = 1; c <= n && r <= n; c++) {
        int tmp = r;
        while(tmp <= n && a[tmp][c] == 0) tmp++;
        
        if(tmp > n) return 0;
        if(tmp != r) {
            for(int j = 1; j <= 2 * n; j++) swap(a[tmp][j], a[r][j]);
        }

        int d = qpow(a[r][c], MOD - 2, MOD); 

        for(int j = 1; j <= 2 * n; j++) a[r][j] = (a[r][j] * d) % MOD;
        for(int k = 1; k <= n; k++) {
            if (k == r) continue;

            int t = a[k][c];
            for(int j = 1; j <= 2 * n; j++) {
                a[k][j] = ((a[k][j] - t * a[r][j]) % MOD + MOD) % MOD;
            }
        }

        r++;
    }
    return r - 1 == n;
}

```

### 行列式求值(任意模数)

```cpp
#include <bits/stdc++.h>
using namespace std;
using i64 = long long;
using u64 = unsigned long long;
const int INF = 0x3f3f3f3f;
const int N = 600 + 10;
#define int i64

int n, p;
int a[N][N];
int cal(int a[][N], int n) {
    int res = 1, fh = 0;

    for (int c = 1; c <= n; c++) {
        int tmp = c;
        while(tmp <= n && a[tmp][c] == 0) tmp++;
        
        if (tmp > n) return 0;
        if (tmp != c) {
            swap(a[tmp], a[c]);
            fh ^= 1;
        }

        for (int j = c + 1; j <= n; j++) {
            if (a[j][c] == 0) continue;

            if (a[j][c] > a[c][c]) {
                swap(a[j], a[c]);
                fh ^= 1;
            }

            while (a[j][c]) {
                int l = a[c][c] / a[j][c];
                for (int k = c; k <= n; k++) {
                    a[c][k] = (a[c][k] + (p - l) * a[j][k]) % p;
                }
                swap(a[j], a[c]);
                fh ^= 1;
            }
        }
    }

    for(int i = 1; i <= n; i++) res = res * a[i][i] % p;

    // cerr << fh << '\n';
    return fh ? (p - res) % p : res;
}

signed main() {
    ios::sync_with_stdio(false);
    cin.tie(0), cout.tie(0);

    cin >> n >> p;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            cin >> a[i][j];
        }
    }
    cout << (cal(a, n) + p) % p << '\n';

    // for (int i = 1; i <= n; i++) {
    //     for (int j = 1; j <= n; j++) {
    //         cerr << a[i][j] << ' ';
    //     }
    //     cerr << '\n';
    // }

    return 0;
}
```

### 多项式

#### FFT 迭代实现
#### 代码为多项式乘法

```cpp
#include <bits/stdc++.h>
using namespace std;
using i64 = long long;
#define int long long
const int INF = 1e18;
const static double PI = acos(-1);
const static double eps = 1e-15;

struct Complex {
    double x, y;
    Complex(double _x = 0.0, double _y = 0.0){
        x = _x;
        y = _y;
    }
    Complex operator - (const Complex &rhs) const {
        return Complex(x - rhs.x, y - rhs.y);
    }
    Complex operator + (const Complex &rhs) const {
        return Complex(x + rhs.x, y + rhs.y);
    }
    Complex operator * (const Complex &rhs) const {
        return Complex(x * rhs.x - y * rhs.y, y * rhs.x + x * rhs.y);
    }
    Complex conj() const {
        return {x, -y}; 
    }
};

vector<int> rev;
vector<Complex> roots;

void init(int n) {
    int h = 0;
    while((1 << h) < n) h++;
    rev.resize(n);
    for(int i = 0; i < n; i++) {
        rev[i] = (rev[i >> 1] >> 1) | ((i & 1) << (h - 1));
    }

    roots.resize(n);
    for(int i = 0; i < n; i++) {
        roots[i] = Complex(cos(2 * PI * i / n), sin(2 * PI * i / n));
    }
}

void fft(vector<Complex>& a, int inv) {
    int n = a.size();
    if(rev.size() != n) init(n);

    for(int i = 0; i < n; i++) {
        if(i < rev[i]) swap(a[i], a[rev[i]]);
    }

    for(int len = 2; len <= n; len <<= 1) {
        int step = n / len;
        for(int i = 0; i < n; i += len) {
            for(int j = 0; j < len / 2; j++) {
                Complex w = roots[step * j];
                if(inv == -1) w = w.conj();
                Complex u = a[i + j], v = a[i + j + len / 2] * w;
                a[i + j] = u + v;
                a[i + j + len / 2] = u - v;
            }
        }
    }
    if(inv == -1) {
        for(auto &[x, y] : a) x /= n;
    }
}

void solve() {
    int n1, n2;
    cin >> n1 >> n2;
    n1++;
    n2++;

    int total = n1 + n2 - 1;
    int n = 1;
    while(n < total) n <<= 1;

    vector<Complex> fa(n), fb(n);

    for(int i = 0; i < n1; i++) cin >> fa[i].x;
    for(int i = 0; i < n2; i++) cin >> fb[i].x;

    fft(fa, 1);
    fft(fb, 1);
    for(int i = 0; i < n; i++) fa[i] = fa[i] * fb[i];
    fft(fa, -1);

    vector<int> res(total);
    for(int i = 0; i < total; i++) res[i] = (int)(fa[i].x + 0.5);
    for(int i = 0; i < total; i++) cout << res[i] << " ";
}

signed main() {
    ios::sync_with_stdio(false);
    cin.tie(0), cout.tie(0);

    int qwq = 1;
    while(qwq--) solve();

    return 0;
}
```

### 和式推导

1. 
   $$
   \sum_{1\leq a \leq b \leq m} p_b = \sum_{b = 2}^{m}p_b \times(b - 1)
   $$

   对于每个 $p_b$ ，其前面的 $p_a$ 的数量都是 $b-1$ 个。

2. 
   $$
   \sum_{1\leq a \leq b \leq m} p_a = \sum_{a = 1}^{m - 1}p_a \times(m - a)
   $$

   对于每个 $p_a$ ，其后面的 $p_b$ 的数量都是 $m-a$ 对。

3. 
   $$
   \sum_{1\leq a \leq b \leq m} 1 = \binom{m}{2} = \frac{m(m-1)}{2}
   $$

   从 $m$ 个位置中任意选择 $2$ 个位置

4. 
   $$
   \begin {aligned}
   \text{Sum}&=  \sum_{i=1}^{n-1}\sum_{j=i+1}^{n}a_i + a_j \\ &=
   \sum_{i=1}^{n-1}\sum_{j=i+1}^{n} a_i + \sum_{i=1}^{n-1}\sum_{j=i+1}^{n} a_j \\ &=
   \sum_{i=1}^{n-1} a_i \cdot (n - i) + \sum_{j=2}^{n} a_j \cdot (j - 1) \\ &= 
   \sum_{i=1}^{n} a_i \cdot (i - 1)
   \end {aligned}
   $$

   双重求和 

   将原本 $O(N^2)$ 的双重循环优化成了两个 $O(N)$ 的单重循环之和。

## 数据结构

### 并查集

```cpp
struct DSU {
    vector<int> fa, sz;
    DSU(int n) : fa(n + 1), sz(n + 1, 1) {
        iota(fa.begin(), fa.end(), 0);
    }
    int find(int u) {
        if (fa[u] != u) fa[u] = find(fa[u]);
        return fa[u];
    }
    bool unite(int u, int v) 
        u = find(u), v = find(v);
        if (u == v) return false;
        if (sz[u] < sz[v]) swap(u, v);
        fa[v] = u;
        sz[u] += sz[v];
        return true;
    }
    bool same(int u, int v) {
        return find(u) == find(v);
    }
    int size(int u) {
        return sz[find(u)];
    }
};
```

### 树状数组

```cpp
struct BIT {
    int n;
    vector<int> tree;
    BIT(int size) : n(size), tree(size + 2) {}

    void update(int x, int v) {
        for (; x <= n; x += x & -x) tree[x] += v;
    }

    int query(int x) {
        int res = 0;
        for (; x > 0; x -= x & -x) res += tree[x];
        return res;
    }

    int query(int l, int r) {
        return query(r) - query(l - 1);
    }
};
```

### ST表

```cpp
struct ST {
    int n, k;
    vector<int> in1, in2;
    vector<vector<int>> Max, Min;

    ST(int n) : n(n), in1(n + 1), in2(n + 1), k(31 - __builtin_clz(n)) {
        Max.resize(k + 1, vector<int>(n + 1));
        Min.resize(k + 1, vector<int>(n + 1));
    }

    void init() {
        for (int i = 1; i <= n; i++) {
            Max[0][i] = in1[i];
            Min[0][i] = in2[i];
        }

        for (int i = 0, t = 1; i < k; i++, t <<= 1) {
            int T = n - (t << 1) + 1;
            for (int j = 1; j <= T; j++) {
                Max[i + 1][j] = max(Max[i][j], Max[i][j + t]);
                Min[i + 1][j] = min(Min[i][j], Min[i][j + t]);
            }
        }
    }

    int getMax(int l, int r) {
        if (l > r) swap(l, r);
        int k = 31 - __builtin_clz(r - l + 1);
        return max(Max[k][l], Max[k][r - (1 << k) + 1]);
    }

    int getMin(int l, int r) {
        if (l > r) swap(l, r);
        int k = 31 - __builtin_clz(r - l + 1);
        return min(Min[k][l], Min[k][r - (1 << k) + 1]);
    }
};
```

### 线段树 - 区间求和 区间加k

```cpp
struct SegTree {
    int n;
    vector<int> a, d, lazy;
    SegTree(int n) : a(n + 1), d(n * 4 + 1), lazy(n * 4 + 1) {};
    
    void pushup(int p) {
        d[p] = d[p << 1] + d[p << 1 | 1];
    }

    void pushdown(int p, int l, int r) {
        if(lazy[p] != 0 && l != r) {
            int mid = (l + r) >> 1;
            int len_l = mid - l + 1;
            int len_r = r - mid;

            d[p << 1] += lazy[p] * len_l;
            lazy[p << 1] += lazy[p];
            
            d[p << 1 | 1] += lazy[p] * len_r;
            lazy[p << 1 | 1] += lazy[p];

            lazy[p] = 0;
        }
    }

    void build(int p, int l, int r) {
        lazy[p] = 0;
        if(l == r) {
            d[p] = a[r];
            return;
        }
        int mid = (l + r) >> 1;
        build(p << 1, l ,mid);
        build(p << 1 | 1, mid + 1, r);
        pushup(p);
    };

    void update(int p, int l, int r, int ql, int qr, int v) {
        if(ql <= l && r <= qr) {
            d[p] += v * (r - l + 1);
            lazy[p] += v;
            return;
        }
        pushdown(p, l, r);
        
        int mid = (l + r) >> 1;
        if(ql <= mid) update(p << 1, l, mid, ql, qr, v);
        if(qr > mid) update(p << 1 | 1, mid + 1, r, ql, qr, v);

        pushup(p);
    }

    int query(int p, int l, int r, int ql, int qr) {
        if(ql <= l && r <= qr) {
            return d[p];
        }

        pushdown(p, l, r);
        int mid = (l + r) >> 1;
        int res = 0;

        if(ql <= mid) res += query(p << 1, l, mid, ql, qr);
        if(qr > mid) res += query(p << 1 | 1, mid + 1, r, ql, qr);
        
        return res;
    }
};
```

### 扫描线 - 离散化

```cpp
#include <bits/stdc++.h>
using namespace std;
using i64 = long long;
using u64 = unsigned long long;
const int INF = 1e9;
#define int long long

struct Line {
    int x1, x2, y, op;
};

struct SegTree{
    int n;
    vector<int> a, v, w;
    SegTree(int size) : a(2 * size + 1), v(size * 8 + 1), w(size * 8 + 1) {}

    void push_up(int L, int R, int u) {
        if(v[u]) w[u] = a[R] - a[L];
        else if(L + 1 == R) w[u] = 0;
        else w[u] = w[2 * u] + w[2 * u | 1]; 
    }

    void add(int L, int R, int op, int u, int ul, int ur) {
        if(L <= ul && ur <= R) {
            v[u] += op;
            push_up(ul, ur, u);
            return;
        }
        int mid = (ul + ur) / 2; 
        if(L < mid) add(L, R, op, 2 * u, ul, mid);
        if(R > mid) add(L, R, op, 2 * u | 1, mid, ur);
        push_up(ul, ur, u);
    }
};

void solve() {
    int n; cin >> n;
    vector<Line> b(n * 2 + 1);
    SegTree t(n);
    for(int i = 1; i <= n; i++) {
        int x1, y1, x2, y2;
        cin >> x1 >> y1 >> x2 >> y2;
        b[i] = {x1, x2, y1, 1};
        b[i + n] = {x1, x2, y2, -1};
        t.a[i] = x1;
        t.a[i + n] = x2;
    }

    sort(t.a.begin() + 1, t.a.begin() + 2 * n + 1);
    t.a.erase(unique(t.a.begin() + 1, t.a.begin() + 2 * n + 1), t.a.end());
    int sz = t.a.size() - 1;

    auto f = [&](int x) {
        return lower_bound(t.a.begin() + 1, t.a.begin() + sz + 1, x) - t.a.begin();
    };

    sort(b.begin() + 1, b.begin() + 2 * n + 1, [&](auto _1, auto _2){
        return _1.y < _2.y;
    });

    int ans = 0;
    for(int i = 1; i <= 2 * n; i++) {
        int x1 = f(b[i].x1);
        int x2 = f(b[i].x2);
        ans += (b[i].y - b[i - 1].y) * t.w[1];
        t.add(x1, x2, b[i].op, 1, 1, sz);
    }
    cout << ans << "\n";
}

signed main(){
    ios::sync_with_stdio(false);
    cin.tie(0), cout.tie(0);

    int T = 1;
    while(T--) solve();

    return 0;
}
```

## 字符串

### 字典树 / Trie

```cpp
#include <bits/stdc++.h>
using namespace std;
using i64 = long long;

int ch[3000010][65];
int cnt[3000010];

struct Trie {
    unordered_map<char, int> mp;

    Trie() {
        int id = 0;
        for(char c = 'a'; c <= 'z'; c++) mp[c] = ++id; 
        for(char c = 'A'; c <= 'Z'; c++) mp[c] = ++id; 
        for(char c = '0'; c <= '9'; c++) mp[c] = ++id; 
    } 

    int idx = 0;
    void insert(string s) {
        int u = 0;
        for(auto c : s) {
            int v = mp[c];
            if(!ch[u][v]) ch[u][v] = ++idx;
            u = ch[u][v];
            cnt[u]++;
        }
    }
    int query(string s) {
        int u = 0;
        for(auto c : s) {
            int v = mp[c];
            if(!ch[u][v]) return 0;
            u = ch[u][v];
        }
        return cnt[u];
    }
    void clear() {
        for(int i = 0; i <= idx; i++) {
            cnt[i] = 0;
            for(int j = 0; j <= 64; j++) {
                ch[i][j] = 0;
            }
        }
        idx = 0;
    }
};

void solve() {
    int n, m; cin >> n >> m;
    
    Trie trie;
    for(int i = 1; i <= n; i++) {
        string s; cin >> s;
        trie.insert(s);
    }
    for(int i = 1; i <= m; i++) {
        string s; cin >> s;
        cout << trie.query(s) << "\n";
    }
    trie.clear();
}

signed main() {
    ios::sync_with_stdio(false);
    cin.tie(0), cout.tie(0);

    int qwq = 1;
    cin >> qwq;
    while(qwq--) solve();

    return 0;
}
```

## 图论

### 最短路 - dijkstra

```cpp
auto dij = [&](int start) {
    fill(dist.begin(), dist.end(), INF);
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> q;
    q.push({dist[start] = 0, start});

    while(q.size()) {
        auto [d, u] = q.top();
        q.pop();
        
        if (dist[u] < d) continue;
        for (auto [v, w] : edge[u]) {
            if (dist[v] > dist[u] + w) {
                dist[v] = dist[u] + w;
                q.push({dist[v], v});
            }
        }
    }
};
```

### 最短路 - floyd

```cpp
vector<vector<int>> a(n + 1, vector<int>(n + 1, INF));
for(int i = 1; i <= n; i++) a[i][i] = 0;

for(int i = 1; i <= m; i++) {
    int u, v, w;
    cin >> u >> v >> w;
    a[u][v] = min(a[u][v], w);
    a[v][u] = min(a[v][u], w);
}    


for(int k = 1; k <= n; k++) {
    for(int i = 1; i <= n; i++) {
        for(int j = 1; j <= n; j++) {
            a[i][j] = min(a[i][j], a[i][k] + a[k][j]);
        }
    }
}
```

### 最小生成树 - kruskal

不用邻接表建图，记录所有的边，排序后用并查集取最小边权和。

```cpp
struct DSU {
    vector<int> sz, fa;
    DSU(int n) : sz(n + 1), fa(n + 1) {
        iota(fa.begin(), fa.end(), 0);
    }

    int find(int u) {
        if(fa[u] != u) fa[u] = find(fa[u]);
        return fa[u];
    }

    bool unite(int u, int v) {
        u = find(u);
        v = find(v);

        if(u == v) return false;

        if(sz[u] < sz[v]) swap(u, v);
        
        fa[v] = u;
        sz[u] += sz[v];

        return true;
    }
};

void solve() {
    struct edge {
        int u, v, w;
    };
    
    int n, m;
    cin >> n >> m;
    
    vector<edge> edges;
    for(int i = 1; i <= m; i++) {
        int u, v, w;
        cin >> u >> v >> w;
        edges.push_back({u, v, w});
    }    

    sort(edges.begin(), edges.end(), [&](auto _1, auto _2) -> bool {
        return _1.w < _2.w;
    });

    DSU dsu(n + 1);

    int ans = 0;
    int cnt = 0;    
    for(auto t : edges) {
        int u = t.u;
        int v = t.v;
        int w = t.w;

        if(dsu.find(u) == dsu.find(v)) continue;

        dsu.unite(u, v);
        ans += w;
        cnt += 1;
    }

    if(cnt == n - 1) cout << ans << "\n";
    else cout << "-1\n";
}
```

## py火车头

```py
import sys, math
from collections import defaultdict, deque, Counter
from heapq import heappush, heappop, heapify
from bisect import bisect_left, bisect_right
from math import gcd, lcm
def lower_bound(a, x): return bisect_left(a, x)
def upper_bound(a, x): return bisect_right(a, x)

sys.setrecursionlimit(10**5)
input = sys.stdin.readline

def solve():
	pass
 
if __name__ == "__main__":
    qwq = 1
    # qwq = int(input())
    for _ in range(qwq):
        solve()
```

