import { createContext, useCallback, useContext, useEffect, useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { Keyboard, Platform, ScrollView, TextInput, type ScrollViewProps } from 'react-native';

/** Lets a focused field ask the surrounding KeyboardScroll to bring it above the keyboard. */
const RevealContext = createContext<() => void>(() => {});

export function useRevealFocusedInput() {
  return useContext(RevealContext);
}

/**
 * ScrollView that keeps the focused input above the software keyboard.
 *
 * Android draws edge-to-edge, so the window no longer resizes for the keyboard and
 * KeyboardAvoidingView does nothing there. Instead we pad the content by the keyboard
 * height and scroll the focused input into the visible area ourselves.
 */
export function KeyboardScroll({
  children,
  contentContainerStyle,
  bottomOffset = 24,
  ...props
}: ScrollViewProps & { children: ReactNode; bottomOffset?: number }) {
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const scrollY = useRef(0);
  const keyboardTop = useRef<number | undefined>(undefined);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const reveal = useCallback(() => {
    const top = keyboardTop.current;
    const input = TextInput.State.currentlyFocusedInput?.();
    if (top === undefined || !input) return;
    input.measureInWindow((_x, y, _width, height) => {
      const overlap = y + height + bottomOffset - top;
      if (overlap > 0) scrollRef.current?.scrollTo({ y: scrollY.current + overlap, animated: true });
    });
  }, [bottomOffset]);

  useEffect(() => {
    const ios = Platform.OS === 'ios';
    const show = Keyboard.addListener(ios ? 'keyboardWillShow' : 'keyboardDidShow', (event) => {
      keyboardTop.current = event.endCoordinates.screenY;
      setKeyboardHeight(event.endCoordinates.height);
      // Wait one frame so the extra bottom padding exists before scrolling into it.
      setTimeout(reveal, ios ? 250 : 60);
    });
    const hide = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', () => {
      keyboardTop.current = undefined;
      setKeyboardHeight(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [reveal]);

  // Moving between fields while the keyboard stays open fires no keyboard event.
  const revealSoon = useCallback(() => {
    setTimeout(reveal, 60);
  }, [reveal]);

  return (
    <RevealContext.Provider value={revealSoon}>
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'}
        scrollEventThrottle={16}
        {...props}
        onScroll={(event) => {
          scrollY.current = event.nativeEvent.contentOffset.y;
          props.onScroll?.(event);
        }}
        contentContainerStyle={[contentContainerStyle, keyboardHeight ? { paddingBottom: keyboardHeight + bottomOffset } : null]}
      >
        {children}
      </ScrollView>
    </RevealContext.Provider>
  );
}
