import { useState } from "react";

interface HistoryFuture<A> {
  state: A;
  futures: Array<HistoryFuture<A>>;
}

interface HistoryPast<A> {
  past: HistoryPast<A> | null;
  state: A;
  alternativeFutures: Array<HistoryFuture<A>>;
}

class HistoryPresent<A> {
  state: A;
  private past: HistoryPast<A> | null;
  private futures: Array<HistoryFuture<A>>;

  constructor({
    state,
    past,
    futures,
  }: {
    state: A;
    past: HistoryPast<A> | null;
    futures: Array<HistoryFuture<A>>;
  }) {
    this.state = state;
    this.past = past;
    this.futures = futures;
  }

  update(newState: A) {
    return new HistoryPresent({
      past: {
        state: this.state,
        past: this.past,
        alternativeFutures: this.futures,
      },
      state: newState,
      futures: [],
    });
  }

  undo() {
    if (this.past) {
      return new HistoryPresent({
        past: this.past.past,
        state: this.past.state,
        futures: [
          {
            state: this.state,
            futures: this.futures,
          },
          ...this.past.alternativeFutures,
        ],
      });
    } else {
      return this;
    }
  }

  redo() {
    if (this.futures.length > 0) {
      const [future, ...alternativeFutures] = this.futures;
      return new HistoryPresent({
        past: {
          past: this.past,
          state: this.state,
          alternativeFutures,
        },
        state: future.state,
        futures: future.futures,
      });
    } else {
      return this;
    }
  }

  static from<A>(initialValue: A): HistoryPresent<A> {
    return new HistoryPresent({ state: initialValue, past: null, futures: [] });
  }
}

export interface HistoryState {
  undo: () => void;
  redo: () => void;
}

export function useStateWithHistory<A>(
  initialState: A
): [A, (newState: A) => void, HistoryState] {
  const [present, setPresent] = useState<HistoryPresent<A>>(() =>
    HistoryPresent.from(initialState)
  );

  const state = present.state;

  const setState = (newState: A) => {
    setPresent(present.update(newState));
  };

  const history: HistoryState = {
    undo() {
      setPresent(present.undo());
    },
    redo() {
      setPresent(present.redo());
    },
  };

  return [state, setState, history];
}
