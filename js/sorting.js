// 三种排序算法实现（无框架依赖，node 或浏览器均可运行）

// 冒泡排序：相邻元素两两比较，大的往后冒
function bubbleSort(arr) {
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
      }
    }
    if (!swapped) break; // 已有序，提前结束
  }
  return a;
}

// 快速排序：选基准分区，递归排序左右两侧
function quickSort(arr) {
  if (arr.length <= 1) return [...arr];
  const pivot = arr[arr.length - 1];
  const left = [];
  const right = [];
  const equal = [];
  for (const x of arr) {
    if (x < pivot) left.push(x);
    else if (x > pivot) right.push(x);
    else equal.push(x);
  }
  return [...quickSort(left), ...equal, ...quickSort(right)];
}

// 归并排序：分半递归排序，再合并两个有序数组
function mergeSort(arr) {
  if (arr.length <= 1) return [...arr];
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  const merged = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    merged.push(left[i] <= right[j] ? left[i++] : right[j++]);
  }
  return [...merged, ...left.slice(i), ...right.slice(j)];
}

module.exports = { bubbleSort, quickSort, mergeSort };

// 直接运行时做简单测试
if (require.main === module) {
  const cases = [
    [5, 2, 9, 1, 7, 3],
    [1, 2, 3, 4, 5],
    [9, 8, 7, 6, 5],
    [42],
    [],
    [3, 3, 1, 3, -2]
  ];

  for (const c of cases) {
    const expected = [...c].sort((x, y) => x - y);
    const results = { bubbleSort: bubbleSort(c), quickSort: quickSort(c), mergeSort: mergeSort(c) };
    for (const [name, result] of Object.entries(results)) {
      const pass = JSON.stringify(result) === JSON.stringify(expected);
      console.log(`${pass ? "PASS" : "FAIL"}  ${name.padEnd(11)} [${c}] -> [${result}]`);
    }
    console.log("---");
  }
}
