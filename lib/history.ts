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

interface HistoryPresent<A> {
  past: HistoryPast<A> | null;
  state: A;
  futures: Array<HistoryFuture<A>>;
}

export interface HistoryState {
  undo: () => void;
  redo: () => void;
}

export function useStateWithHistory<A>(
  initialState: A
): [A, (newState: A) => void, HistoryState] {
  const [present, setPresent] = useState<HistoryPresent<A>>({
    past: null,
    state: initialState,
    futures: [],
  });
  const state = present.state;

  const setState = (newState: A) => {
    setPresent({
      past: {
        state: present.state,
        past: present.past,
        alternativeFutures: present.futures,
      },
      state: newState,
      futures: [],
    });
  };

  const history: HistoryState = {
    undo() {
      if (present.past) {
        setPresent({
          past: present.past.past,
          state: present.past.state,
          futures: [present, ...present.past.alternativeFutures],
        });
      }
    },

    redo() {
      if (present.futures.length > 0) {
        const [future, ...alternativeFutures] = present.futures;
        setPresent({
          past: {
            past: present.past,
            state: present.state,
            alternativeFutures,
          },
          state: future.state,
          futures: future.futures,
        });
      }
    },
  };

  return [state, setState, history];
}
