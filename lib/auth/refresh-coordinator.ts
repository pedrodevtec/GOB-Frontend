export interface RefreshCoordinatorOptions<T> {
  run: () => Promise<T>;
  withCrossTabLock?: (run: () => Promise<T>) => Promise<T>;
  isRotationConflict?: (error: unknown) => boolean;
  wait?: () => Promise<void>;
}

export function createRefreshCoordinator<T>(options: RefreshCoordinatorOptions<T>) {
  let pending: Promise<T> | null = null;

  async function execute() {
    if (options.withCrossTabLock) {
      return options.withCrossTabLock(options.run);
    }

    try {
      return await options.run();
    } catch (error) {
      if (!options.isRotationConflict?.(error)) throw error;
      await (options.wait?.() ?? Promise.resolve());
      return options.run();
    }
  }

  return () => {
    if (!pending) {
      pending = execute().finally(() => {
        pending = null;
      });
    }
    return pending;
  };
}

