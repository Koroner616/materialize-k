describe('Tooltip:', () => {
  const fixture = `<a
  id="test"
  class="btn tooltipped"
  data-position="bottom"
  data-delay="50"
  data-tooltip="I am tooltip">
    Hover me!
</a>

<a
  id="test1"
  class="btn tooltipped"
  data-position="bottom"
  data-delay="50"
  data-tooltip="I am a tooltip that is really really long so that I would definitely overflow off the screen if I were not smart!">
   Hover me!
</a>

<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>

<div style="position: fixed; top: 50%; left: 50%;">
  <a
    id="test2"
    class="btn tooltipped"
    data-position="bottom"
    data-delay="50"
    data-tooltip="Fixed position tooltip">
     Hover me!
  </a>
</div>`;

  beforeEach(() => {
    XloadHtml(fixture);
    M.Tooltip.init(document.querySelectorAll('.tooltipped'), {
      enterDelay: 0,
      exitDelay: 0,
      inDuration: 0,
      outDuration: 0
    });
  });
  afterEach(() => XunloadFixtures());

  describe('opens and closes properly', () => {
    it('shows tooltip on mouse enter', (done) => {
      const tooltippedBtn = document.querySelector('#test');
      const tooltip = M.Tooltip.getInstance(tooltippedBtn).tooltipEl;
      mouseenter(tooltippedBtn);
      setTimeout(() => {
        expect(tooltip).toBeVisible('because mouse entered tooltipped btn');
        expect(tooltip.querySelector('.tooltip-content').innerText).toBe(
          'I am tooltip',
          'because that is the defined text in the html attribute'
        );
        mouseleave(tooltippedBtn);
        setTimeout(() => {
          expect(tooltip).toBeVisible('because mouse left tooltipped btn');
          done();
        }, 10);
      }, 10);
    });

    it('should place tooltips on the bottom within the screen bounds', (done) => {
      const tooltippedBtn = document.querySelector('#test1');
      const tooltip = M.Tooltip.getInstance(tooltippedBtn).tooltipEl;
      mouseenter(tooltippedBtn);
      // tooltippedBtn.trigger('mouseenter');
      setTimeout(() => {
        const tooltipRect = tooltip.getBoundingClientRect();
        const tooltippedBtnRect = tooltippedBtn.getBoundingClientRect();
        // Check window bounds
        expect(tooltipRect.top).toBeGreaterThanOrEqual(0);
        expect(tooltipRect.bottom).toBeLessThanOrEqual(window.innerHeight);
        expect(tooltipRect.left).toBeGreaterThanOrEqual(0);
        expect(tooltipRect.right).toBeLessThanOrEqual(window.innerWidth);
        // check if tooltip is under btn
        expect(tooltipRect.top).toBeGreaterThan(tooltippedBtnRect.bottom);
        done();
      }, 10);
    });

    it('removes tooltip dom object', () => {
      const tooltippedBtn = document.querySelector('#test1');
      M.Tooltip.getInstance(tooltippedBtn).destroy();
      // Check DOM element is removed
      const tooltipInstance = M.Tooltip.getInstance(tooltippedBtn);
      expect(tooltipInstance).toBe(undefined);
    });

    it('changes position attribute dynamically and positions tooltips on the right correctly', (done) => {
      const tooltippedBtn = document.querySelector('#test');
      tooltippedBtn.setAttribute('data-position', 'right');
      const tooltip = M.Tooltip.getInstance(tooltippedBtn).tooltipEl;
      mouseenter(tooltippedBtn);
      setTimeout(() => {
        const tooltipRect = tooltip.getBoundingClientRect();
        const tooltippedBtnRect = tooltippedBtn.getBoundingClientRect();
        expect(tooltipRect.left).toBeGreaterThan(tooltippedBtnRect.right);
        done();
      }, 10);
    });

    it('accepts delay option from javascript initialization', (done) => {
      const tooltippedBtn = document.querySelector('#test');
      tooltippedBtn.removeAttribute('data-delay');
      M.Tooltip.init(tooltippedBtn, { enterDelay: 200 });
      const tooltip = M.Tooltip.getInstance(tooltippedBtn).tooltipEl;
      mouseenter(tooltippedBtn);
      setTimeout(() => {
        const tooltipVisibility = getComputedStyle(tooltip).getPropertyValue('visibility');
        expect(tooltipVisibility).toBe('hidden', 'because the delay is 200 seconds');
      }, 150);
      setTimeout(() => {
        expect(tooltip).toBeVisible('because 200 seconds has passed');
        done();
      }, 250);
    });

    it('works with a fixed position parent', (done) => {
      const tooltippedBtn = document.querySelector('#test2');
      const tooltip = M.Tooltip.getInstance(tooltippedBtn).tooltipEl;
      mouseenter(tooltippedBtn);
      setTimeout(() => {
        const tooltipRect = tooltip.getBoundingClientRect();
        const tooltippedBtnRect = tooltippedBtn.getBoundingClientRect();
        const verticalDiff = tooltipRect.top - tooltippedBtnRect.top;
        const horizontalDiff =
          tooltipRect.left +
          tooltipRect.width / 2 -
          (tooltippedBtnRect.left + tooltippedBtnRect.width / 2);
        // 52 is magic number for tooltip vertical offset... increased to 100
        expect(verticalDiff > 0 && verticalDiff < 100).toBeTruthy(
          'top position in fixed to be correct'
        );
        expect(horizontalDiff > -1 && horizontalDiff < 1).toBeTruthy(
          'left position in fixed to be correct'
        );
        done();
      }, 10);
    });
  });
});
