---
layout: post
title: Chirp 信号与语谱图（specgram）示例
date: 2026-08-24
category: 算法
tags: [EEG, 信号处理, MATLAB, Chirp, librosa]
---

用 MATLAB 生成 Chirp 扫频并画语谱图；后面是 Python 用 librosa / soundfile 读音频、重采样。采样点数 `N=1024`，采样率 `fs=1000` Hz。

## 代码

```matlab
fs = 1000;
N = 1024;
t = (0:N-1) / fs;
x1 = chirp(t, 0, 1, 350);

subplot(211);
plot(t, x1);
ylabel('Chirp signal y1');
axis([0 1.05 -1.1 1.1]);

Fs = 1;
M = 128;
subplot(212);
[B, f] = specgram(x1, M, Fs, hanning(M), M-1);
tt = (M-1:N) / fs;
imagesc(tt, f', abs(B));
axis xy;
ylabel('Frequency (Hz)');
xlabel('Time (second)');
```

## 说明

| 变量 / 函数 | 含义 |
|-------------|------|
| `fs = 1000` | 采样率 1000 Hz |
| `N = 1024` | 采样点数 |
| `t = (0:N-1)/fs` | 时间轴，约 0–1.023 s |
| `chirp(t, 0, 1, 350)` | 从 0 Hz 起，在 t=1 s 时扫到 350 Hz |
| `subplot(211)` | 上图：时域波形 |
| `M = 128` | 短时窗长度 |
| `specgram(..., hanning(M), M-1)` | 汉宁窗，重叠点数 `M-1` |
| `imagesc` + `axis xy` | 下图：语谱图，纵轴频率向上增大 |

上图看 Chirp 的时域振荡，下图看频率随时间升高的扫频轨迹。

## Python：librosa 读音频

Cam / 采集链路里用 Python 读波形时：

参考：[librosa IO formats](https://librosa.org/doc/latest/ioformats.html#read-file-like-objects)

```python
import librosa
import soundfile as sf

filename = librosa.ex("trumpet")
data, samplerate = sf.read(filename, dtype="float32")
data = data.T
data_22k = librosa.resample(data, orig_sr=samplerate, target_sr=22050)
```

大文件可按块读（Blockwise Reading），避免一次载入整段波形。
