import { Utils } from './utils';
import { Component, BaseOptions, InitElements, MElement, Openable } from './component';

export interface TapTargetOptions extends BaseOptions {
  /**
   * Callback function called when Tap Target is opened.
   * @default null
   */
  onOpen: (origin: HTMLElement) => void;
  /**
   * Callback function called when Tap Target is closed.
   * @default null
   */
  onClose: (origin: HTMLElement) => void;
}

const _defaults: TapTargetOptions = {
  onOpen: null,
  onClose: null
};

export class TapTarget extends Component<TapTargetOptions> implements Openable {
  /**
   * If the tap target is open.
   */
  isOpen: boolean;

  static _taptargets: TapTarget[];
  private wrapper: HTMLElement;
  // private _origin: HTMLElement;
  private originEl: HTMLElement;
  private waveEl: HTMLElement & Element & Node;
  private contentEl: HTMLElement;

  constructor(el: HTMLElement, options: Partial<TapTargetOptions>) {
    super(el, options, TapTarget);
    this.el['M_TapTarget'] = this;

    this.options = {
      ...TapTarget.defaults,
      ...options
    };

    this.isOpen = false;
    // setup
    this.originEl = document.querySelector(`#${el.dataset.target}`);
    this.originEl.tabIndex = 0;

    this._setup();
    this._calculatePositioning();
    this._setupEventHandlers();

    TapTarget._taptargets.push(this);
  }

  static get defaults(): TapTargetOptions {
    return _defaults;
  }

  /**
   * Initializes instance of TapTarget.
   * @param el HTML element.
   * @param options Component options.
   */
  static init(el: HTMLElement, options?: Partial<TapTargetOptions>): TapTarget;
  /**
   * Initializes instances of TapTarget.
   * @param els HTML elements.
   * @param options Component options.
   */
  static init(els: InitElements<MElement>, options?: Partial<TapTargetOptions>): TapTarget[];
  /**
   * Initializes instances of TapTarget.
   * @param els HTML elements.
   * @param options Component options.
   */
  static init(
    els: HTMLElement | InitElements<MElement>,
    options: Partial<TapTargetOptions> = {}
  ): TapTarget | TapTarget[] {
    return super.init(els, options, TapTarget);
  }

  static getInstance(el: HTMLElement): TapTarget {
    return el['M_TapTarget'];
  }

  destroy() {
    this._removeEventHandlers();
    this.el['M_TapTarget'] = undefined;
    const index = TapTarget._taptargets.indexOf(this);
    if (index >= 0) {
      TapTarget._taptargets.splice(index, 1);
    }
  }

  _setupEventHandlers() {
    this.originEl.addEventListener('click', this._handleTargetToggle);
    this.originEl.addEventListener('keypress', this._handleKeyboardInteraction, true);
    // this.originEl.addEventListener('click', this._handleOriginClick);
    // Resize
    window.addEventListener('resize', this._handleThrottledResize);
  }

  _removeEventHandlers() {
    this.originEl.removeEventListener('click', this._handleTargetToggle);
    this.originEl.removeEventListener('keypress', this._handleKeyboardInteraction, true);
    // this.originEl.removeEventListener('click', this._handleOriginClick);
    window.removeEventListener('resize', this._handleThrottledResize);
  }

  _handleThrottledResize = (): void => Utils.throttle(this._handleResize, 200).bind(this);

  _handleKeyboardInteraction = (e: KeyboardEvent) => {
    if (Utils.keys.ENTER.includes(e.key)) {
      this._handleTargetToggle();
    }
  };

  _handleTargetToggle = () => {
    if (!this.isOpen) this.open();
    else this.close();
  };

  /*_handleOriginClick = () => {
    this.close();
  }*/

  _handleResize = () => {
    this._calculatePositioning();
  };

  _handleDocumentClick = (e: MouseEvent | TouchEvent | KeyboardEvent) => {
    if (
      (e.target as HTMLElement).closest(`#${this.el.dataset.target}`) !== this.originEl &&
      !(e.target as HTMLElement).closest('.tap-target-wrapper')
    ) {
      this.close();
      // e.preventDefault();
      // e.stopPropagation();
    }
  };

  _setup() {
    // Creating tap target
    this.wrapper = this.el.parentElement;
    this.waveEl = this.wrapper.querySelector('.tap-target-wave');
    this.el.parentElement.ariaExpanded = 'false';
    this.originEl.style.zIndex = '1002';
    // this.originEl = this.wrapper.querySelector('.tap-target-origin');
    this.contentEl = this.el.querySelector('.tap-target-content');
    // Creating wrapper
    if (!this.wrapper.classList.contains('.tap-target-wrapper')) {
      this.wrapper = document.createElement('div');
      this.wrapper.classList.add('tap-target-wrapper');
      this.el.before(this.wrapper);
      this.wrapper.append(this.el);
    }
    // Creating content
    if (!this.contentEl) {
      this.contentEl = document.createElement('div');
      this.contentEl.classList.add('tap-target-content');
      this.el.append(this.contentEl);
    }
    // Creating foreground wave
    if (!this.waveEl) {
      this.waveEl = document.createElement('div');
      this.waveEl.classList.add('tap-target-wave');
      // Creating origin
      /*if (!this.originEl) {
        this.originEl = <HTMLElement>this._origin.cloneNode(true); // .clone(true, true);
        this.originEl.classList.add('tap-target-origin');
        this.originEl.removeAttribute('id');
        this.originEl.removeAttribute('style');
        this.waveEl.append(this.originEl);
      }*/
      this.wrapper.append(this.waveEl);
    }
  }

  private _offset(el: HTMLElement) {
    const box = el.getBoundingClientRect();
    const docElem = document.documentElement;
    return {
      top: box.top + window.pageYOffset - docElem.clientTop,
      left: box.left + window.pageXOffset - docElem.clientLeft
    };
  }

  _calculatePositioning() {
    // Element or parent is fixed position?
    let isFixed = getComputedStyle(this.originEl).position === 'fixed';
    if (!isFixed) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let currentElem: any = this.originEl;
      const parents = [];
      while ((currentElem = currentElem.parentNode) && currentElem !== document)
        parents.push(currentElem);

      for (let i = 0; i < parents.length; i++) {
        isFixed = getComputedStyle(parents[i]).position === 'fixed';
        if (isFixed) break;
      }
    }
    // Calculating origin
    const originWidth = this.originEl.offsetWidth;
    const originHeight = this.originEl.offsetHeight;
    const originTop = isFixed
      ? this._offset(this.originEl).top - Utils.getDocumentScrollTop()
      : this._offset(this.originEl).top;
    const originLeft = isFixed
      ? this._offset(this.originEl).left - Utils.getDocumentScrollLeft()
      : this._offset(this.originEl).left;

    // Calculating screen
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const scrollBarWidth = windowWidth - document.documentElement.clientWidth;
    const centerX = windowWidth / 2;
    const centerY = windowHeight / 2;
    const isLeft = originLeft <= centerX;
    const isRight = originLeft > centerX;
    const isTop = originTop <= centerY;
    const isBottom = originTop > centerY;
    const isCenterX = originLeft >= windowWidth * 0.25 && originLeft <= windowWidth * 0.75;

    // Calculating tap target
    const tapTargetWidth = this.el.offsetWidth;
    const tapTargetHeight = this.el.offsetHeight;
    const tapTargetTop = originTop + originHeight / 2 - tapTargetHeight / 2;
    const tapTargetLeft = originLeft + originWidth / 2 - tapTargetWidth / 2;
    const tapTargetPosition = isFixed ? 'fixed' : 'absolute';

    // Calculating content
    const tapTargetTextWidth = isCenterX ? tapTargetWidth : tapTargetWidth / 2 + originWidth;
    const tapTargetTextHeight = tapTargetHeight / 2;
    const tapTargetTextTop = isTop ? tapTargetHeight / 2 : 0;
    const tapTargetTextBottom = 0;
    const tapTargetTextLeft = isLeft && !isCenterX ? tapTargetWidth / 2 - originWidth : 0;
    const tapTargetTextRight = 0;
    const tapTargetTextPadding = originWidth;
    const tapTargetTextAlign = isBottom ? 'bottom' : 'top';

    // Calculating wave
    const tapTargetWaveWidth = originWidth > originHeight ? originWidth * 2 : originWidth * 2;
    const tapTargetWaveHeight = tapTargetWaveWidth;
    const tapTargetWaveTop = tapTargetHeight / 2 - tapTargetWaveHeight / 2;
    const tapTargetWaveLeft = tapTargetWidth / 2 - tapTargetWaveWidth / 2;

    // Setting tap target
    this.wrapper.style.top = isTop ? tapTargetTop + 'px' : '';
    this.wrapper.style.right = isRight
      ? windowWidth - tapTargetLeft - tapTargetWidth - scrollBarWidth + 'px'
      : '';
    this.wrapper.style.bottom = isBottom
      ? windowHeight - tapTargetTop - tapTargetHeight + 'px'
      : '';
    this.wrapper.style.left = isLeft ? tapTargetLeft + 'px' : '';
    this.wrapper.style.position = tapTargetPosition;

    // Setting content
    this.contentEl.style.width = tapTargetTextWidth + 'px';
    this.contentEl.style.height = tapTargetTextHeight + 'px';
    this.contentEl.style.top = tapTargetTextTop + 'px';
    this.contentEl.style.right = tapTargetTextRight + 'px';
    this.contentEl.style.bottom = tapTargetTextBottom + 'px';
    this.contentEl.style.left = tapTargetTextLeft + 'px';
    this.contentEl.style.padding = tapTargetTextPadding + 'px';
    this.contentEl.style.verticalAlign = tapTargetTextAlign;

    // Setting wave
    this.waveEl.style.top = tapTargetWaveTop + 'px';
    this.waveEl.style.left = tapTargetWaveLeft + 'px';
    this.waveEl.style.width = tapTargetWaveWidth + 'px';
    this.waveEl.style.height = tapTargetWaveHeight + 'px';
  }

  /**
   * Open Tap Target.
   */
  open = () => {
    if (this.isOpen) return;
    // onOpen callback
    if (typeof this.options.onOpen === 'function') {
      this.options.onOpen.call(this, this.originEl);
    }
    this.isOpen = true;
    this.wrapper.classList.add('open');
    this.wrapper.ariaExpanded = 'true';
    document.body.addEventListener('click', this._handleDocumentClick, true);
    document.body.addEventListener('keypress', this._handleDocumentClick, true);
    document.body.addEventListener('touchend', this._handleDocumentClick);
  };

  /**
   * Close Tap Target.
   */
  close = () => {
    if (!this.isOpen) return;
    // onClose callback
    if (typeof this.options.onClose === 'function') {
      this.options.onClose.call(this, this.originEl);
    }
    this.isOpen = false;
    this.wrapper.classList.remove('open');
    this.wrapper.ariaExpanded = 'false';
    document.body.removeEventListener('click', this._handleDocumentClick, true);
    document.body.removeEventListener('keypress', this._handleDocumentClick, true);
    document.body.removeEventListener('touchend', this._handleDocumentClick);
  };

  static {
    TapTarget._taptargets = [];
  }
}
