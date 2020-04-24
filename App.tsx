import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableHighlight,
  TouchableHighlightProps,
  TouchableOpacity,
} from "react-native";

type Stack = Value[];
type Value = number;

function parseValue(text: string): Value {
  return parseFloat(text);
}

const STACK_VIEW_SIZE = 7;

function stackView(stack: Stack): Array<Value | undefined> {
  return [
    ...stack.slice(0, STACK_VIEW_SIZE),
    ...new Array(Math.max(0, STACK_VIEW_SIZE - stack.length)).fill(undefined),
  ];
}

function useStack() {
  const [stack, rawSetStack] = useState<Stack>([]);

  const setStack = (newStack: Stack) => {
    if (newStack.length === 0) {
      rawSetStack([]);
    } else {
      rawSetStack(newStack);
    }
  };

  const push = (x: Value): void => {
    setStack([x, ...stack]);
  };

  const tos = stack[0];

  const unaryOp = (fn: (x: Value) => Value) => {
    if (stack.length < 1) return;
    const [tos, ...rest] = stack;
    setStack([fn(tos), ...rest]);
  };

  const binaryOp = (fn: (x: Value, y: Value) => Value) => {
    if (stack.length < 2) return;
    const [x, y, ...rest] = stack;
    setStack([fn(x, y), ...rest]);
  };

  const setTOS = (x: Value): void => {
    unaryOp((_) => x);
  };

  const dropNth = (i: number): void => {
    setStack([...stack.slice(0, i), ...stack.slice(i + 1)]);
  };

  return { stack, tos, setStack, push, setTOS, dropNth, unaryOp, binaryOp };
}

interface ButtonProps extends TouchableHighlightProps {
  title: string;
}

function Button(props: ButtonProps) {
  const { title, ...otherProps } = props;
  return (
    <TouchableHighlight style={{ borderWidth: 0, flexGrow: 1 }} {...otherProps}>
      <View style={styles.button}>
        <Text style={styles.buttonText}>{title}</Text>
      </View>
    </TouchableHighlight>
  );
}

function Op(props: ButtonProps) {
  return (
    <View style={styles.op}>
      <Button {...props} />
    </View>
  );
}

export default function App() {
  const [enteringMode, setEnteringMode] = useState(false);

  const { tos, stack, ...ops } = useStack();

  const inputRef = useRef<TextInput>(null);

  return (
    <View style={styles.container}>
      {stackView(stack)
        .map((value, i) => {
          return (
            <View key={i} style={styles.stackEntry}>
              <Text style={styles.stackEntryIndex}>{i}: </Text>

              <TouchableOpacity
                style={{ flex: 1 }}
                onLongPress={() => {
                  if (value) {
                    ops.push(value);
                  }
                }}
              >
                <View style={styles.stackEntryText}>
                  <TextInput
                    editable={false}
                    keyboardType="numeric"
                    value={value === undefined ? "" : String(value)}
                  />
                </View>
              </TouchableOpacity>

              <View style={{ opacity: value === undefined ? 0 : 1 }}>
                <Button
                  title="x"
                  onPress={() => {
                    ops.dropNth(i);
                  }}
                />
              </View>
            </View>
          );
        })
        .reverse()}

      {enteringMode && (
        <TextInput
          style={styles.input}
          autoFocus
          ref={inputRef}
          keyboardType="numeric"
          onSubmitEditing={(e) => {
            const x = parseValue(e.nativeEvent.text);
            ops.push(x);
            inputRef.current?.clear();
            setEnteringMode(false);
          }}
        />
      )}

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "flex-start",
        }}
      >
        <Op
          title="DUP"
          onPress={() => {
            if (stack.length > 0) {
              ops.push(tos);
            }
          }}
        />
        <Op
          title="SWAP"
          onPress={() => {
            if (stack.length < 2) return;
            const [x, y, ...rest] = stack;
            ops.setStack([y, x, ...rest]);
          }}
        />
        <Op
          title="DROP"
          onPress={() => {
            if (stack.length === 0) return;
            ops.dropNth(0);
          }}
        />
        <Op
          title="CLEAR"
          onPress={() => {
            ops.setStack([]);
          }}
        />
        <Op
          title="NUM"
          onPress={() => {
            setEnteringMode(true);
          }}
        />

        <Op
          title="+"
          onPress={() => {
            ops.binaryOp((x, y) => x + y);
          }}
        />
        <Op
          title="*"
          onPress={() => {
            ops.binaryOp((x, y) => x * y);
          }}
        />
        <Op
          title="-"
          onPress={() => {
            ops.binaryOp((x, y) => y - x);
          }}
        />
        <Op
          title="/"
          onPress={() => {
            ops.binaryOp((x, y) => y / x);
          }}
        />
        <Op
          title="NEG"
          onPress={() => {
            ops.unaryOp((x) => -x);
          }}
        />
        <Op
          title="C"
          onPress={() => {
            if (stack.length === 0) {
              ops.setStack([0]);
            } else {
              ops.unaryOp((_) => 0);
            }
          }}
        />
        <Op
          title="RND"
          onPress={() => {
            ops.push(Math.random());
          }}
        />
        <Op
          title="√"
          onPress={() => {
            ops.unaryOp((x) => Math.sqrt(x));
          }}
        />
        <Op
          title="1/x"
          onPress={() => {
            ops.unaryOp((x) => 1 / x);
          }}
        />
        <Op
          title="π"
          onPress={() => {
            ops.push(Math.PI);
          }}
        />
        <Op
          title="e"
          onPress={() => {
            ops.push(Math.E);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  op: {
    padding: 5,
    width: "20%",
  },

  button: {
    backgroundColor: "#ddd",
    padding: 20,
    flexDirection: "row",
    justifyContent: "center",
    elevation: 2,
  },

  buttonText: {
    fontSize: 10,
  },

  container: {
    padding: 10,
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  input: {
    backgroundColor: "white",
    elevation: 2,
    shadowRadius: 5,
    margin: 20,
    padding: 20,
  },

  stackEntry: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  stackEntryIndex: {
    color: "#555",
  },
  stackEntryText: {
    padding: 10,
    flexGrow: 1,
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
  },
});
