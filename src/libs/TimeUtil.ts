// TimeUtil.ts
export class TimeUtil {
  // --------------------------------
  // 💤 基本：待機系
  // --------------------------------

  /**
   * 指定ミリ秒待つ（sleep）
   *
   * 使用例:
   *   await TimeUtil.sleep(2000); // 2秒待つ
   */
  static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 指定時間後に一度だけ処理を実行する（Promise版 setTimeout ラッパー）
   *
   * 使用例:
   *   await TimeUtil.delay(3000);
   *   console.log("3秒後に実行");
   */
  static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 指定時間以内に処理が終わらない場合 reject する
   *
   * 使用例:
   *   const res = await TimeUtil.timeout(fetch("/api/data"), 5000);
   */
  static timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timerId = setTimeout(() => {
        reject(new Error(`Timeout after ${ms}ms`));
      }, ms);

      promise
        .then((v) => {
          clearTimeout(timerId);
          resolve(v);
        })
        .catch((err) => {
          clearTimeout(timerId);
          reject(err);
        });
    });
  }

  /**
   * 条件が true になるまで待つ
   *
   * 使用例:
   *   await TimeUtil.waitUntil(() => window.myLibLoaded === true, 100, 5000);
   */
  static async waitUntil(
    condition: () => boolean,
    intervalMs: number = 100,
    timeoutMs: number = 10000 // デフォルト10秒でタイムアウト
  ): Promise<void> {
    const startTime = Date.now();
    while (!condition()) {
      if (Date.now() - startTime > timeoutMs) {
        throw new Error(`waitUntil timed out after ${timeoutMs}ms`);
      }
      await this.sleep(intervalMs);
    }
  }

  // --------------------------------
  // ⏳ タイマー系
  // --------------------------------

  /**
   * カウントダウンタイマーを開始する
   * totalMs から 0 まで intervalMs ごとに onTick を呼び、
   * 0 になったら onComplete を呼ぶ。
   *
   * 戻り値: タイマーを停止するための関数
   *
   * 使用例:
   *   const stop = TimeUtil.startCountdown({
   *     totalMs: TimeUtil.seconds(30),
   *     intervalMs: 1000,
   *     onTick: (remainingMs) => {
   *       console.log("残りms:", remainingMs);
   *     },
   *     onComplete: () => {
   *       console.log("タイマー終了！");
   *     },
   *   });
   *
   *   // 途中で止めたい場合:
   *   // stop();
   */
  static startCountdown(options: {
    totalMs: number; // 全体の時間（ミリ秒）
    intervalMs?: number; // tick 間隔（デフォルト: 1000ms）
    onTick?: (remainingMs: number) => void; // 残り時間ごとに呼ばれる
    onComplete?: () => void; // 0 になったときに呼ばれる
  }): () => void {
    const { totalMs, onTick, onComplete } = options;
    const intervalMs = options.intervalMs ?? 1000;
    const startTime = Date.now();

    // 初回実行
    onTick?.(totalMs);

    const timerId: ReturnType<typeof setInterval> = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, totalMs - elapsed);

      if (remaining <= 0) {
        clearInterval(timerId);
        onTick?.(0);
        onComplete?.();
        return;
      }

      onTick?.(remaining);
    }, intervalMs);

    // 停止用関数
    return () => {
      clearInterval(timerId);
    };
  }

  /**
   * 簡易ストップウォッチ
   * performance.now() を使用して高精度に計測します
   *
   * 使用例:
   *   const sw = TimeUtil.stopwatch();
   *   // ... なにか処理 ...
   *   console.log("処理時間:", sw.end(), "ms");
   */
  static stopwatch() {
    const startTime = performance.now();
    return {
      start: startTime,
      end: () => performance.now() - startTime,
    };
  }

  // --------------------------------
  // 🕒 時間変換・フォーマット系
  // --------------------------------

  /**
   * 秒 → ミリ秒
   *
   * 使用例:
   *   await TimeUtil.sleep(TimeUtil.seconds(3));
   */
  static seconds(sec: number): number {
    return sec * 1000;
  }

  /**
   * 分 → ミリ秒
   *
   * 使用例:
   *   await TimeUtil.sleep(TimeUtil.minutes(1)); // 1分待つ
   */
  static minutes(min: number): number {
    return min * 60 * 1000;
  }

  /**
   * 時間 → ミリ秒
   *
   * 使用例:
   *   await TimeUtil.sleep(TimeUtil.hours(2)); // 2時間分のミリ秒
   */
  static hours(h: number): number {
    return h * 60 * 60 * 1000;
  }

  /**
   * 秒を mm:ss に変換
   *
   * 使用例:
   *   TimeUtil.formatSeconds(95); // "1:35"
   */
  static formatSeconds(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  /**
   * 現在時刻（ミリ秒）を返す
   *
   * 使用例:
   *   const t = TimeUtil.now();
   */
  static now(): number {
    return Date.now();
  }

  /**
   * 現在の Date オブジェクトを返す
   *
   * 使用例:
   *   const now = TimeUtil.getCurrentTime();
   */
  static getCurrentTime(): Date {
    return new Date();
  }

  /**
   * 現在時刻を "HH:mm:ss" 形式で返す
   *
   * 使用例:
   *   const timeStr = TimeUtil.getCurrentTimeString(); // "12:34:56"
   */
  static getCurrentTimeString(): string {
    const d = new Date();
    const h = this.pad(d.getHours());
    const m = this.pad(d.getMinutes());
    const s = this.pad(d.getSeconds());
    return `${h}:${m}:${s}`;
  }

  // --------------------------------
  // 📅 日付フォーマット・パース系
  // --------------------------------

  /**
   * Date → "yyyy-MM-dd" に変換
   *
   * 使用例:
   *   TimeUtil.toDateString();                  // 今日の日付
   *   TimeUtil.toDateString(new Date(2025,0,1)) // "2025-01-01"
   */
  static toDateString(date: Date = new Date()): string {
    const y = date.getFullYear();
    const m = this.pad(date.getMonth() + 1);
    const d = this.pad(date.getDate());
    return `${y}-${m}-${d}`;
  }

  /**
   * Date → "yyyy-MM-dd HH:mm:ss" に変換
   *
   * 使用例:
   *   TimeUtil.toDateTimeString(); // "2025-11-27 02:45:00" など
   */
  static toDateTimeString(date: Date = new Date()): string {
    const base = this.toDateString(date);
    const h = this.pad(date.getHours());
    const mi = this.pad(date.getMinutes());
    const s = this.pad(date.getSeconds());
    return `${base} ${h}:${mi}:${s}`;
  }

  /**
   * 2つの日付の差分をミリ秒で返す
   *
   * 使用例:
   *   const ms = TimeUtil.diffMs(new Date("2025-01-01"), new Date());
   */
  static diffMs(a: Date, b: Date): number {
    return a.getTime() - b.getTime();
  }

  /**
   * 差分ミリ秒 → { hours, minutes, seconds } に分解
   *
   * 使用例:
   *   const diff = TimeUtil.diffDetail(1234567);
   *   // diff = { hours: 0, minutes: 20, seconds: 34 } など
   */
  static diffDetail(ms: number): {
    hours: number;
    minutes: number;
    seconds: number;
  } {
    const h = Math.floor(ms / (1000 * 60 * 60));
    const mi = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((ms % (1000 * 60)) / 1000);
    return { hours: h, minutes: mi, seconds: s };
  }

  /**
   * "yyyy-MM-dd" を Date に変換
   * ブラウザのタイムゾーンに依存せず、ローカル時間としてパースします
   *
   * 使用例:
   *   const d = TimeUtil.parseDate("2025-12-24");
   */
  static parseDate(dateStr: string): Date {
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) {
      throw new Error(`Invalid date format: ${dateStr}`);
    }
    return new Date(y, m - 1, d);
  }

  /**
   * "yyyy-MM-dd HH:mm:ss" を Date に変換
   * ブラウザのタイムゾーンに依存せず、ローカル時間としてパースします
   *
   * 使用例:
   *   const d = TimeUtil.parseDateTime("2025-12-24 18:30:00");
   */
  static parseDateTime(dateTimeStr: string): Date {
    const [datePart, timePart] = dateTimeStr.split(" ");
    if (!datePart || !timePart) {
      throw new Error(`Invalid datetime format: ${dateTimeStr}`);
    }

    const [y, m, d] = datePart.split("-").map(Number);
    const [h, mi, s] = timePart.split(":").map(Number);

    if (
      y === undefined ||
      m === undefined ||
      d === undefined ||
      h === undefined ||
      mi === undefined ||
      s === undefined
    ) {
      throw new Error(`Invalid datetime format: ${dateTimeStr}`);
    }

    return new Date(y, m - 1, d, h, mi, s);
  }

  // --------------------------------
  // 🔒 内部ヘルパー
  // --------------------------------

  /**
   * 2桁ゼロ埋め
   */
  private static pad(n: number): string {
    return n.toString().padStart(2, "0");
  }
}