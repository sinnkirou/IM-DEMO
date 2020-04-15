import React from 'react';
import styles from './index.less';

interface IProps {
  isPlaying: boolean,
}

const Index = (props: IProps) => {
  const { isPlaying } = props;
  return (
    <div className={styles.box}>
      <div className={styles.wiFiSymbol}>
        <div className={`${styles.wiFiCircle} ${styles.first}`} />
        <div
          className={`${styles.wiFiCircle} ${!isPlaying ? styles.second : styles.secondPlaying}`}
        />
        <div
          className={`${styles.wiFiCircle} ${!isPlaying ? styles.third : styles.thirdPlaying}`}
        />
      </div>
    </div>
  );
};

export default Index;
