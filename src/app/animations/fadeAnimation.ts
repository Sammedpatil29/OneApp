import { AnimationController, Animation } from '@ionic/angular';

export const fadeAnimation = (baseEl: HTMLElement, opts?: any): Animation => {
  const animationCtrl = new AnimationController();

  // Create the animation for the entering page
  const enteringAnimation = animationCtrl.create()
    .addElement(opts.enteringEl)
    .duration(300)
    .easing('ease-in')
    .fromTo('opacity', 0, 1); // Fade In

  // Create the animation for the leaving page
  const leavingAnimation = animationCtrl.create()
    .addElement(opts.leavingEl)
    .duration(300)
    .easing('ease-out')
    .fromTo('opacity', 1, 0); // Fade Out

  // Combine them
  return animationCtrl.create()
    .addAnimation([enteringAnimation, leavingAnimation]);
};