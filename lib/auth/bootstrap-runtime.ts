import type { RefreshFailureDetails } from "./bootstrap-policy";

export interface BootstrapRuntimeOptions<T> {
  refresh: () => Promise<T>;
  classify: (error: unknown) => RefreshFailureDetails;
  onSession: (session: T) => void;
  onTerminal: (details: RefreshFailureDetails) => void;
  onRecoverable: (details: RefreshFailureDetails) => void;
  onDiagnostic?: (details: RefreshFailureDetails) => void;
  wait?: () => Promise<void>;
  automaticRetries?: number;
}

export function createBootstrapRuntime<T>(options: BootstrapRuntimeOptions<T>) {
  let active = true;
  let generation = 0;

  async function restore(automaticRetries: number) {
    const currentGeneration = ++generation;
    let retryCount = 0;

    while (active && currentGeneration === generation) {
      try {
        const session = await options.refresh();
        if (active && currentGeneration === generation) options.onSession(session);
        return;
      } catch (error) {
        if (!active || currentGeneration !== generation) return;
        const details = options.classify(error);
        if (details.kind === "superseded") return;
        options.onDiagnostic?.(details);

        if (details.kind === "terminal") {
          options.onTerminal(details);
          return;
        }
        if (details.kind === "rotation-conflict") {
          options.onRecoverable(details);
          return;
        }
        if (retryCount >= automaticRetries) {
          options.onRecoverable(details);
          return;
        }
        retryCount += 1;
        await (options.wait?.() ?? Promise.resolve());
      }
    }
  }

  return {
    start: () => restore(options.automaticRetries ?? 1),
    retry: () => restore(options.automaticRetries ?? 1),
    dispose: () => {
      active = false;
      generation += 1;
    }
  };
}
