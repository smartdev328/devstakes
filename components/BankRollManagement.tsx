import { Button } from 'antd';
import React, { useState } from 'react';

import styles from './BettingFundamentals.module.css';
import { MinusEncloseIcon, PlusEncloseIcon } from './SvgIcons';
import { MOCK_BankRoll } from '@constants/index';

type PropsType = {
  showContentAt: boolean[];
  toggleDetailsAt: (index: number) => void;
};

function BankrollManagment({ showContentAt, toggleDetailsAt }: PropsType) {
  return (
    <div className={styles.sidebarBlock}>
      <div className={styles.sidebarBlockTitle}>
        <img
          src={'/images/bank-roll.svg'}
          height="32px"
          width="32px"
          style={{ paddingRight: '7px' }}
        />

        <span>Bankroll Management </span>
      </div>
      <div className={styles.sidebarBlockContent}>
        {MOCK_BankRoll.map((data, index) => (
          <React.Fragment key={index}>
            <div className={styles.accordionTitle}>
              {showContentAt[index] && (
                <>
                  <strong className={styles.handIcon} onClick={() => toggleDetailsAt(index)}>
                    {data.title}
                  </strong>
                  <Button ghost className={styles.ghostBtn} onClick={() => toggleDetailsAt(index)}>
                    <MinusEncloseIcon className={styles.accordionTitleIcon} />
                  </Button>
                </>
              )}
              {!showContentAt[index] && (
                <>
                  <span className={styles.handIcon} onClick={() => toggleDetailsAt(index)}>
                    {data.title}
                  </span>
                  <Button ghost className={styles.ghostBtn} onClick={() => toggleDetailsAt(index)}>
                    <PlusEncloseIcon className={styles.accordionTitleIcon} />
                  </Button>
                </>
              )}
            </div>
            {showContentAt[index] && (
              <div
                className={styles.accordionContent}
                dangerouslySetInnerHTML={{ __html: data.content }}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function BankrollManagmentRender() {
  const [showContent, setShowContent] = useState<boolean[]>([]);
  const toggleDetailsAt = (id: number) => {
    showContent[id] = !showContent[id];
    setShowContent(showContent.slice());
  };

  return (
    <BankrollManagment
      showContentAt={showContent}
      toggleDetailsAt={toggleDetailsAt}></BankrollManagment>
  );
}

export default BankrollManagmentRender;
