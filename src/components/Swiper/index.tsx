import _ from 'lodash';
import React, { PureComponent } from 'react';
import Swiper from 'swiper';
import styles from './index.less';

class Index extends PureComponent<{
  curImageIndex: number,
  imageURLs: string[],
  closeSwipe: ()=>void,
  [propName: string]: any,
}> {
  public swiper = null;

  public componentDidMount() {
    const { imageURLs, closeSwipe, curImageIndex } = this.props;

    this.swiper = new Swiper('.swiper-container', {
      zoom: true,
      width: window.innerWidth,
      virtual: true,
      spaceBetween: 20,
      pagination: {
        el: '.swiper-pagination',
        type: 'fraction',
      },
      on: {
        click() {
          this.virtual.slides.length = 0;
          this.virtual.cache = [];
          closeSwipe();
        },
      },
    });

    _.forEach(imageURLs, item => {
      this.swiper.virtual.appendSlide(
        `<div class="swiper-zoom-container"><img src="${item}" /></div>`
      );
    });
    this.swiper.slideTo(curImageIndex, 0);
  }

  public componentWillUnmount() {
    this.swiper = null;
  }

  public render() {
    return (
      <div className={styles.swiperContainer}>
        <div className="swiper-container" id="origin-img">
          <div className="swiper-wrapper" />
          <div className="swiper-pagination" />
        </div>
      </div>
    );
  }
}

export default Index;
