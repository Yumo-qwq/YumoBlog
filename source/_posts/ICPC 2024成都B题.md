---
title: ICPC 2024 成都 B题
date: 2026-03-26 18:18
tags: [算法竞赛, 计数DP]
categories:
  - 算法竞赛
  - 计数DP
banner_img: /img/luo8th.png
index_img: /img/blog01.jpg
excerpt: Athlete Welcome Ceremony 题解。
math: true
---

# ICPC 2024 成都 B题

计数DP、前缀和。

## 题意

给定一个长度为 $n$ 的包含 `a`, `b`, `c`, `?` 的字符串。$Q$ 次询问，每次给定三个整数 $x, y, z$，问有多少种将 `?` 替换为 `a`, `b`, `c` 的方案，使得相邻字符不相同，且替换掉的 `?` 中 `a` 的数量不超过 $x$，`b` 的数量不超过 $y$，`c` 的数量不超过 $z$。

$Q$ 很大，而 $n$ 很小，并且发现合法字符串的数量与 $Q$ 次查询内给的数据是没有联系的，可以先进行预处理，再进行查询。

## DP 定义

定义 $dp_{idx, x, y, type}$ $( type \in \{a, b, c\} )$表示前 $idx$ 个字符中，填写 `?` 使用了 $x$ 个 `a`、$y$ 个 `b`， 并且第 $idx$ 个字符是 $type$ 的合法字符串数量。

由于字符串中 `?` 的数量是给定的，所以手动计算出 `c` 的数量为 $cnt - x - y$ 。可以压掉一维，不压的话会卡空间。

## DP 转移

根据第一个字符，初始化 $dp_{1, x, y, type} \leftarrow 1$。

然后从第二个字符开始，进行三维DP，转移过程如下：

### 字符为 `?`

此时可以填写字符，可对三种字符都进行枚举，根据题目要求，相邻的字符不能相同，所以只能从与当前枚举到的 $type$ 类型不同的状态进行转移，具体地：

```cpp
dp[i][j][k][1] = dp[i-1][j-1][k][2] + dp[i-1][j-1][k][3]; 
dp[i][j][k][2] = dp[i-1][j][k-1][1] + dp[i-1][j][k-1][3]; 
dp[i][j][k][3] = dp[i-1][j][k][1] + dp[i-1][j][k][2];                     
```

### 字符不为 `?`

此时的转移与上面类似，只是使用的数量不变。

```cpp
if(s[i] == 'a') dp[i][j][k][1] = dp[i-1][j][k][2] + dp[i-1][j][k][3]; // a
if(s[i] == 'b') dp[i][j][k][2] = dp[i-1][j][k][1] + dp[i-1][j][k][3]; // b
if(s[i] == 'c') dp[i][j][k][3] = dp[i-1][j][k][1] + dp[i-1][j][k][2]; // c            
```

这样便做完了一个 $O(n^3)$ 的预处理。

## 前缀和

预处理完成后，每次查询需要计算 $\sum_{a < x, b < y, c < z} dp_{n, a, b, type}$ 的数量，放在查询内会超时，所以需要做三维前缀和优化。

## 其余优化

由于转移只会发生在相邻字符之间，所以可以用滚动数组优化一下空间。

## 代码

具体实现需要注意一下边界条件。

```cpp
int dp[2][310][310][5];
int pre[312][312][312];

void solve2() {
    int n, Q;
    string s;
    cin >> n >> Q >> s;

    s = " " + s;

    vector<int> cnt(n + 1);
    for(int i = 1; i <= n; i++) {
        if(s[i] == '?') cnt[i] = cnt[i-1]+1;
        else cnt[i] = cnt[i-1];
    }

    // dp[idx][x][y][type]

    if(s[1] == '?') {
        dp[1][1][0][1] = 1;
        dp[1][0][1][2] = 1;
        dp[1][0][0][3] = 1;
    }
    if(s[1] == 'a') dp[1][0][0][1] = 1;
    if(s[1] == 'b') dp[1][0][0][2] = 1;
    if(s[1] == 'c') dp[1][0][0][3] = 1;

    for(int i = 2; i <= n; i++) {
        int cur = i & 1;
        int lst = !cur;
        memset(dp[cur], 0, sizeof(dp[cur]));
     
        for(int j = 0; j <= n; j++) {
            for(int k = 0; k <= n; k++) {
                int c = cnt[i] - j - k;
                if(c < 0) continue;

                if(s[i] == '?') {
                    if(j > 0) dp[cur][j][k][1] = dp[lst][j-1][k][2] + dp[lst][j-1][k][3]; // a
                    if(k > 0) dp[cur][j][k][2] = dp[lst][j][k-1][1] + dp[lst][j][k-1][3]; // b
                    if(c > 0) dp[cur][j][k][3] = dp[lst][j][k][1] + dp[lst][j][k][2];     // c
                }
                if(s[i] == 'a') dp[cur][j][k][1] = dp[lst][j][k][2] + dp[lst][j][k][3]; // a
                if(s[i] == 'b') dp[cur][j][k][2] = dp[lst][j][k][1] + dp[lst][j][k][3]; // b
                if(s[i] == 'c') dp[cur][j][k][3] = dp[lst][j][k][1] + dp[lst][j][k][2]; // c
                
                dp[cur][j][k][1] %= MOD;
                dp[cur][j][k][2] %= MOD;
                dp[cur][j][k][3] %= MOD;
            }
        }
    }

    int d = n & 1;
    for(int i = 0; i <= cnt[n]; i++) {
        for(int j = 0; j <= cnt[n]; j++) {
            int k = cnt[n] - i - j;
            if(k < 0) continue;
            pre[i][j][k] = (dp[d][i][j][1] + dp[d][i][j][2] + dp[d][i][j][3]) % MOD;
        }
    }

    for(int i = 0; i <= cnt[n]; i++) {
        for(int j = 0; j <= cnt[n]; j++) {
            for(int k = 0; k <= cnt[n]; k++) {
                if(i > 0) pre[i][j][k] = (pre[i][j][k] + pre[i-1][j][k]) % MOD;
                if(j > 0) pre[i][j][k] = (pre[i][j][k] + pre[i][j-1][k]) % MOD;
                if(k > 0) pre[i][j][k] = (pre[i][j][k] + pre[i][j][k-1]) % MOD;
                
                if(i > 0 && j > 0) pre[i][j][k] = (pre[i][j][k] - pre[i-1][j-1][k] + MOD) % MOD;
                if(i > 0 && k > 0) pre[i][j][k] = (pre[i][j][k] - pre[i-1][j][k-1] + MOD) % MOD;
                if(j > 0 && k > 0) pre[i][j][k] = (pre[i][j][k] - pre[i][j-1][k-1] + MOD) % MOD;
                
                if(i > 0 && j > 0 && k > 0) pre[i][j][k] = (pre[i][j][k] + pre[i-1][j-1][k-1]) % MOD;
            }
        }
    }

    while(Q--) {
        int x, y, z;
        cin >> x >> y >> z;
        cout << pre[min(x, cnt[n])][min(y, cnt[n])][min(z, cnt[n])] << "\n";
    }
}
```

**时间复杂度**：预处理 $O(n^3)$，查询 $O(Q)$。总复杂度 $O(n^3 + Q)$。