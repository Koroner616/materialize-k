import { Edges } from './edges';
import { Bounding } from './bounding';

/**
 * Class with utilitary functions for global usage.
 */
export class Utils {
  /** Specifies wether tab is pressed or not. */
  static tabPressed: boolean = false;
  /** Specifies wether there is a key pressed. */
  static keyDown: boolean = false;

  /**
   * Key maps.
   */
  static keys = {
    TAB: ['Tab'],
    ENTER: ['Enter'],
    ESC: ['Escape', 'Esc'],
    BACKSPACE: ['Backspace'],
    ARROW_UP: ['ArrowUp', 'Up'],
    ARROW_DOWN: ['ArrowDown', 'Down'],
    ARROW_LEFT: ['ArrowLeft', 'Left'],
    ARROW_RIGHT: ['ArrowRight', 'Right'],
    DELETE: ['Delete', 'Del']
  };

  /**
   * Detects when a key is pressed.
   * @param e Event instance.
   */
  static docHandleKeydown(e: KeyboardEvent) {
    Utils.keyDown = true;
    if ([...Utils.keys.TAB, ...Utils.keys.ARROW_DOWN, ...Utils.keys.ARROW_UP].includes(e.key)) {
      Utils.tabPressed = true;
    }
  }

  /**
   * Detects when a key is released.
   * @param e Event instance.
   */
  static docHandleKeyup(e: KeyboardEvent) {
    Utils.keyDown = false;
    if ([...Utils.keys.TAB, ...Utils.keys.ARROW_DOWN, ...Utils.keys.ARROW_UP].includes(e.key)) {
      Utils.tabPressed = false;
    }
  }

  /**
   * Detects when document is focused.
   * @param e Event instance.
   */
  /* eslint-disabled as of required event type condition check */
  /* eslint-disable-next-line */
  static docHandleFocus(e: FocusEvent) {
    if (Utils.keyDown) {
      document.body.classList.add('keyboard-focused');
    }
  }

  /**
   * Detects when document is not focused.
   * @param e Event instance.
   */
  /* eslint-disabled as of required event type condition check */
  /* eslint-disable-next-line */
  static docHandleBlur(e: FocusEvent) {
    document.body.classList.remove('keyboard-focused');
  }

  /**
   * Generates a unique string identifier.
   */
  static guid(): string {
    const s4 = (): string => {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  /**
   * Checks for exceeded edges
   * @param container Container element.
   * @param bounding Bounding rect.
   * @param offset Element offset.
   */
  static checkWithinContainer(container: HTMLElement, bounding: Bounding, offset: number): Edges {
    const edges = {
      top: false,
      right: false,
      bottom: false,
      left: false
    };

    const containerRect = container.getBoundingClientRect();
    // If body element is smaller than viewport, use viewport height instead.
    const containerBottom =
      container === document.body
        ? Math.max(containerRect.bottom, window.innerHeight)
        : containerRect.bottom;

    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;

    const scrolledX = bounding.left - scrollLeft;
    const scrolledY = bounding.top - scrollTop;

    // Check for container and viewport for each edge
    if (scrolledX < containerRect.left + offset || scrolledX < offset) {
      edges.left = true;
    }

    if (
      scrolledX + bounding.width > containerRect.right - offset ||
      scrolledX + bounding.width > window.innerWidth - offset
    ) {
      edges.right = true;
    }

    if (scrolledY < containerRect.top + offset || scrolledY < offset) {
      edges.top = true;
    }

    if (
      scrolledY + bounding.height > containerBottom - offset ||
      scrolledY + bounding.height > window.innerHeight - offset
    ) {
      edges.bottom = true;
    }

    return edges;
  }

  /**
   * Checks if element can be aligned in multiple directions.
   * @param el Element to be inspected.
   * @param container Container element.
   * @param bounding Bounding rect.
   * @param offset Element offset.
   */
  static checkPossibleAlignments(
    el: HTMLElement,
    container: HTMLElement,
    bounding: Bounding,
    offset: number
  ) {
    const canAlign: {
      top: boolean;
      right: boolean;
      bottom: boolean;
      left: boolean;
      spaceOnTop: number;
      spaceOnRight: number;
      spaceOnBottom: number;
      spaceOnLeft: number;
    } = {
      top: true,
      right: true,
      bottom: true,
      left: true,
      spaceOnTop: null,
      spaceOnRight: null,
      spaceOnBottom: null,
      spaceOnLeft: null
    };

    const containerAllowsOverflow = getComputedStyle(container).overflow === 'visible';
    const containerRect = container.getBoundingClientRect();
    const containerHeight = Math.min(containerRect.height, window.innerHeight);
    const containerWidth = Math.min(containerRect.width, window.innerWidth);
    const elOffsetRect = el.getBoundingClientRect();

    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;

    const scrolledX = bounding.left - scrollLeft;
    const scrolledYTopEdge = bounding.top - scrollTop;
    const scrolledYBottomEdge = bounding.top + elOffsetRect.height - scrollTop;

    // Check for container and viewport for left
    canAlign.spaceOnRight = !containerAllowsOverflow
      ? containerWidth - (scrolledX + bounding.width)
      : window.innerWidth - (elOffsetRect.left + bounding.width);
    if (canAlign.spaceOnRight < 0) {
      canAlign.left = false;
    }

    // Check for container and viewport for Right
    canAlign.spaceOnLeft = !containerAllowsOverflow
      ? scrolledX - bounding.width + elOffsetRect.width
      : elOffsetRect.right - bounding.width;
    if (canAlign.spaceOnLeft < 0) {
      canAlign.right = false;
    }

    // Check for container and viewport for Top
    canAlign.spaceOnBottom = !containerAllowsOverflow
      ? containerHeight - (scrolledYTopEdge + bounding.height + offset)
      : window.innerHeight - (elOffsetRect.top + bounding.height + offset);
    if (canAlign.spaceOnBottom < 0) {
      canAlign.top = false;
    }

    // Check for container and viewport for Bottom
    canAlign.spaceOnTop = !containerAllowsOverflow
      ? scrolledYBottomEdge - (bounding.height - offset)
      : elOffsetRect.bottom - (bounding.height + offset);
    if (canAlign.spaceOnTop < 0) {
      canAlign.bottom = false;
    }

    return canAlign;
  }

  /**
   * Retrieves target element id from trigger.
   * @param trigger Trigger element.
   */
  static getIdFromTrigger(trigger: HTMLElement): string {
    let id = trigger.dataset.target;
    if (!id) {
      id = trigger.getAttribute('href');
      return id ? id.slice(1) : '';
    }
    return id;
  }

  /**
   * Retrieves document scroll postion from top.
   */
  static getDocumentScrollTop(): number {
    return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  /**
   * Retrieves document scroll postion from left.
   */
  static getDocumentScrollLeft(): number {
    return window.scrollX || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
  }

  /**
   * Fires the given function after a certain ammount of time.
   * @param func Function to be fired.
   * @param wait Wait time.
   * @param options Additional options.
   */
  static throttle(
    func: (Function: object) => void,
    wait: number,
    options: Partial<{ leading: boolean; trailing: boolean }> = {}
  ) {
    let context: object,
      args: IArguments,
      result,
      timeout = null,
      previous = 0;

    const later = () => {
      previous = options.leading === false ? 0 : new Date().getTime();
      timeout = null;
      result = func.apply(context, args);
      context = args = null;
    };

    return (...args) => {
      const now = new Date().getTime();
      if (!previous && options.leading === false) previous = now;
      const remaining = wait - (now - previous);
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(this, args);
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  }

  /**
   * Renders confirm/close buttons with callback function
   */
  static createConfirmationContainer(
    container: HTMLElement,
    confirmText: string,
    cancelText: string,
    onConfirm: (Function: object) => void,
    onCancel: (Function: object) => void
  ): void {
    const confirmationButtonsContainer = document.createElement('div');
    confirmationButtonsContainer.classList.add('confirmation-btns');
    container.append(confirmationButtonsContainer);

    this.createButton(confirmationButtonsContainer, cancelText, ['btn-cancel'], true, onCancel);
    this.createButton(confirmationButtonsContainer, confirmText, ['btn-confirm'], true, onConfirm);
  }

  /**
   * Renders a button with optional callback function
   */
  static createButton(
    container: HTMLElement,
    text: string,
    className: string[] = [],
    visibility: boolean = true,
    callback: (Function: object) => void = null
  ): void {
    className = className.concat(['btn', 'waves-effect', 'text']);
    const button = document.createElement('button');
    button.className = className.join(' ');
    button.style.visibility = visibility ? 'visible' : 'hidden';
    button.type = 'button';
    button.tabIndex = !!visibility ? 0 : -1;
    button.innerText = text;
    button.addEventListener('click', callback);
    button.addEventListener('keypress', (e) => {
      if (Utils.keys.ENTER.includes(e.key)) callback(e);
    });
    container.append(button);
  }

  static _setAbsolutePosition(
    origin: HTMLElement,
    container: HTMLElement,
    position: string,
    margin: number,
    transitionMovement: number,
    align: string = 'center'
  ) {
    const originHeight = origin.offsetHeight,
      originWidth = origin.offsetWidth,
      containerHeight = container.offsetHeight,
      containerWidth = container.offsetWidth;
    let xMovement = 0,
      yMovement = 0,
      targetTop = origin.getBoundingClientRect().top + Utils.getDocumentScrollTop(),
      targetLeft = origin.getBoundingClientRect().left + Utils.getDocumentScrollLeft();

    if (position === 'top') {
      targetTop += -containerHeight - margin;
      if (align === 'center') {
        targetLeft += originWidth / 2 - containerWidth / 2; // This is center align
      }
      yMovement = -transitionMovement;
    } else if (position === 'right') {
      targetTop += originHeight / 2 - containerHeight / 2;
      targetLeft = originWidth + margin;
      xMovement = transitionMovement;
    } else if (position === 'left') {
      targetTop += originHeight / 2 - containerHeight / 2;
      targetLeft = -containerWidth - margin;
      xMovement = -transitionMovement;
    } else {
      targetTop += originHeight + margin;
      if (align === 'center') {
        targetLeft += originWidth / 2 - containerWidth / 2; // This is center align
      }
      yMovement = transitionMovement;
    }
    if (align === 'right') {
      targetLeft += originWidth - containerWidth - margin;
    }

    const newCoordinates = Utils._repositionWithinScreen(
      targetLeft,
      targetTop,
      containerWidth,
      containerHeight,
      margin,
      transitionMovement,
      align
    );

    container.style.top = newCoordinates.y + 'px';
    container.style.left = newCoordinates.x + 'px';

    return {x: xMovement, y: yMovement};
  }

  static _repositionWithinScreen(
    x: number,
    y: number,
    width: number,
    height: number,
    margin: number,
    transitionMovement: number,
    align: string
  ) {
    const scrollLeft = Utils.getDocumentScrollLeft();
    const scrollTop = Utils.getDocumentScrollTop();
    let newX = x - scrollLeft;
    let newY = y - scrollTop;

    const bounding: Bounding = {
      left: newX,
      top: newY,
      width: width,
      height: height
    };
    let offset: number;
    if (align === 'left' || align == 'center') {
      offset = margin + transitionMovement;
    } else if (align === 'right') {
      offset = margin - transitionMovement;
    }
    const edges = Utils.checkWithinContainer(document.body, bounding, offset);

    if (edges.left) {
      newX = offset;
    } else if (edges.right) {
      newX -= newX + width - window.innerWidth;
    }
    if (edges.top) {
      newY = offset;
    } else if (edges.bottom) {
      newY -= newY + height - window.innerHeight;
    }
    return {
      x: newX + scrollLeft,
      y: newY + scrollTop
    };
  }
}
