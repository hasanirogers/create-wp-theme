const pagestoExecuteOn = ['', 'home', 'about', 'booking', 'testimonials', 'contact'];
const shouldExecute = pagestoExecuteOn.includes(document.documentElement.dataset.page ?? '');

if (shouldExecute) {
  const scrollSnapContainer = document.querySelector('main') as HTMLElement;
  const mainHeaderNav = document.querySelector('[slot=body] > header nav') as HTMLElement;

  scrollSnapContainer.addEventListener('scrollsnapchange', (event) => {
    const snappedViewElement = (event as any).snapTargetBlock.firstElementChild;
    const viewSlug = snappedViewElement.tagName.toLowerCase().replace('business-view-', '');


    mainHeaderNav.querySelectorAll('a').forEach((link) => {
      link.classList.remove('active');
    });
    mainHeaderNav.querySelector(`a[href*="${viewSlug}"]`)?.classList.add('active');

    if (!pagestoExecuteOn.includes(viewSlug)) {
      console.log('viewSlug not in pagestoExecuteOn', viewSlug);
      return;
    }

    window.history.replaceState(null, '', `/${viewSlug}/`);
    document.documentElement.dataset.page = viewSlug;
  });

  const scrollToCurrent = () => {
    const { pathname } = window.location;
    const element = pathname.replace(/\//g, '');
    const target = document.querySelector(`business-view-${element}`);
    target && target.scrollIntoView({ behavior: 'smooth' });
    mainHeaderNav.querySelector(`a[href*="${element}"]`)?.classList.add('active');
  }


  const initApp = () => {
    scrollToCurrent();
  }

  document.addEventListener('DOMContentLoaded', initApp);
}
