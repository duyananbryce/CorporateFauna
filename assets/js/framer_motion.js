export function animate(element, keyframes, options) {
    const animationOptions = {
        duration: (options?.duration || 0.4) * 1000,
        delay: (options?.delay || 0) * 1000,
        easing: options?.ease === 'easeOut' ? 'ease-out' : options?.ease || 'ease',
        fill: 'forwards'
    };

    let hasFromArray = false;
    for (const prop in keyframes) {
        if (Array.isArray(keyframes[prop])) {
            hasFromArray = true;
            break;
        }
    }

    let keyframesToUse;

    if (hasFromArray) {
        const fromFrame = {};
        const toFrame = {};
        const fromTransform = [];
        const toTransform = [];

        for (const prop in keyframes) {
            const value = keyframes[prop];
            if (Array.isArray(value)) {
                switch (prop) {
                    case 'y': fromTransform.push(`translateY(${value[0]}px)`); toTransform.push(`translateY(${value[1]}px)`); break;
                    case 'x': fromTransform.push(`translateX(${value[0]}px)`); toTransform.push(`translateX(${value[1]}px)`); break;
                    case 'scale': fromTransform.push(`scale(${value[0]})`); toTransform.push(`scale(${value[1]})`); break;
                    default: fromFrame[prop] = value[0]; toFrame[prop] = value[1];
                }
            } else {
                switch (prop) {
                    case 'y': toTransform.push(`translateY(${value}px)`); break;
                    case 'x': toTransform.push(`translateX(${value}px)`); break;
                    case 'scale': toTransform.push(`scale(${value})`); break;
                    default: toFrame[prop] = value;
                }
            }
        }
        if (fromTransform.length) fromFrame.transform = fromTransform.join(' ');
        if (toTransform.length) toFrame.transform = toTransform.join(' ');
        keyframesToUse = [fromFrame, toFrame];
    } else {
        const toFrame = {};
        const toTransform = [];
        for (const prop in keyframes) {
            const value = keyframes[prop];
            switch (prop) {
                case 'y': toTransform.push(`translateY(${value}px)`); break;
                case 'x': toTransform.push(`translateX(${value}px)`); break;
                case 'scale': toTransform.push(`scale(${value})`); break;
                default: toFrame[prop] = value;
            }
        }
        if (toTransform.length) toFrame.transform = toTransform.join(' ');
        keyframesToUse = toFrame;
    }

    const animation = element.animate(keyframesToUse, animationOptions);
    return animation.finished;
}
