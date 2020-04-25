import React from "react";
import { View, Text } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import "@testing-library/jest-native/extend-expect";

import { useStateWithHistory } from "./history";

describe("useStateWithHistory", () => {
  const Component: React.FC<{ initialState: number }> = ({ initialState }) => {
    const [state, setState, history] = useStateWithHistory(initialState);
    return (
      <View>
        <Text testID="state">{state}</Text>
        <Text testID="inc" onPress={() => setState(state + 1)}>
          {state}
        </Text>
        <Text testID="undo" onPress={() => history.undo()}></Text>
      </View>
    );
  };

  function instantiate(initialState: number) {
    const { getByTestId } = render(<Component initialState={initialState} />);
    return {
      state: getByTestId("state"),
      inc: getByTestId("inc"),
      undo: getByTestId("undo"),
    };
  }

  test("basic usage behaves like regular useState", () => {
    const { state } = instantiate(1);
    expect(state).toHaveTextContent("1");
  });

  test("can udpate the state", () => {
    const { state, inc } = instantiate(1);
    fireEvent.press(inc);
    expect(state).toHaveTextContent("2");
  });

  test("can undo updates", () => {
    const { state, inc, undo } = instantiate(1);
    fireEvent.press(inc);
    fireEvent.press(inc);
    expect(state).toHaveTextContent("3");

    fireEvent.press(undo);
    expect(state).toHaveTextContent("2");

    fireEvent.press(undo);
    expect(state).toHaveTextContent("1");
  });
});
