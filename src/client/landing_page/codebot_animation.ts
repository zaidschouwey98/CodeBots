import Rellax from "rellax";
import $ from "jquery";

new Rellax(".title-header");
new Rellax(".background-image");

function animateCodebot(element, speed, leftToRight) {
    let currentScroll = $(window).scrollTop()!;
    const total = $(window).height()! - currentScroll;
    const currPosition = 0;
    const offset = leftToRight ? element.offset().left : 0;
    const trackLength = $(window).width()! - element.width() - 2 * offset;
    $(window).on("scroll", () => {
        currentScroll = $(window).scrollTop()!;
        const movement = Math.min(
            trackLength * (currentScroll / total) * speed,
            trackLength
        );
        const newPosition = currPosition + movement + "px";
        if (leftToRight) {
            element.css({ left: newPosition });
        } else {
            element.css({ right: newPosition });
        }
    });
}

animateCodebot($("#pathBot"), 1.5, true);
animateCodebot($("#imgBot"), 3, false);
