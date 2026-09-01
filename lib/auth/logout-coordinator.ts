export interface LogoutResult {
  remote: boolean;
  outcome: string;
}

export async function executeLogout(options: {
  request: () => Promise<string>;
  clearLocal: () => void;
  isUpstreamUnavailable: (error: unknown) => boolean;
}): Promise<LogoutResult> {
  try {
    return { remote: true, outcome: await options.request() };
  } catch (error) {
    if (options.isUpstreamUnavailable(error)) {
      return { remote: false, outcome: "local_only" };
    }
    throw error;
  } finally {
    options.clearLocal();
  }
}

