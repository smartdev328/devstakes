/* eslint-disable react/display-name */
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Row, Button, Col, Carousel, notification } from 'antd';
// import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import LazyLoad from 'react-lazyload';

import { AppLayout, BannerSportsAndMatches, DashboardHeader, SportEntry } from '@components/index';
import {
  ListIcon,
  MinusEncloseIcon,
  MoneyPocketIcon,
  OpenBookIcon,
  PlusEncloseIcon
} from '@components/SvgIcons';
import styles from '@styles/YesterdaysPlays.module.css';
import { PageProps, YesterdayPlayInfoType } from '@type/Main';
import { F1_SVG, NBA_SVG, NFL_SVG, UFC_SVG, SOCCER_SVG, MLB_SVG } from '@components/SportIcons';
import { useRouter } from 'next/router';
import SportsAPIs from '@apis/sport.apis';
import { Sport } from '@type/Sports';

const SPORTS_INFO = [
  {
    name: 'NBA',
    id: 'NBA',
    background: '#EC4C15',
    logo: () => <NBA_SVG className={styles.sports_logo} />
  },
  {
    name: 'NFL',
    id: 'NFL',
    background: '#91442A',
    logo: () => <NFL_SVG className={styles.sports_logo} />
  },
  {
    name: 'MLB',
    id: 'MLB',
    background: '#1878FB',
    logo: () => <MLB_SVG className={styles.sports_logo} />
  },
  {
    name: 'NCAAF',
    id: 'NFL',
    background: '#91442A',
    logo: () => <NFL_SVG className={styles.sports_logo} />
  },
  {
    name: 'NCAAB',
    id: 'NBA',
    background: '#EC4C15',
    logo: () => <NBA_SVG className={styles.sports_logo} />
  },
  {
    name: 'Soccer',
    id: 'SOCCER',
    background: '#6DCF40',
    logo: () => <SOCCER_SVG className={styles.sports_logo} />
  },
  {
    name: 'UFC',
    id: 'UFC',
    background: '#F9282B',
    logo: () => <UFC_SVG className={styles.sports_logo} />
  },
  {
    name: 'Formula 1',
    id: 'F1',
    background: '#505054',
    logo: () => <F1_SVG className={styles.sports_logo} />
  }
];

export default function YesterdaysPlays({ token, subscriptions, sports }: PageProps) {
  const [unlockedItems, setUnlockedItems] = useState<number[]>();
  const [games, setGames] = useState<YesterdayPlayInfoType[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [fetchMoreLoading, setFetchMoreLoading] = useState<boolean>(false);
  const [entireLoading, setEntireLoading] = useState<boolean>(false);

  useEffect(() => {
    onLoadMore();
  }, []);

  useEffect(() => {
    if (sports.length > 0) {
      setUnlockedItems([sports[0].id, sports[1].id]);
    }
  }, [sports]);

  // Update Filters
  const updateFilters = (sportId: number, status: boolean) => {
    setEntireLoading(true);
    SportsAPIs.getYesterdaySportEntries(0, status ? sportId : undefined)
      .then((res) => res.json())
      .then((data) => {
        setGames(data);
        setOffset(data.length);
        setEntireLoading(false);
      })
      .catch((error) => {
        notification['error']({
          message: 'Registration Error!',
          description: error.message
        });
        setFetchMoreLoading(false);
      });
  };

  const onLoadMore = () => {
    setFetchMoreLoading(true);
    SportsAPIs.getYesterdaySportEntries(offset, undefined)
      .then((res) => res.json())
      .then((data) => {
        setGames(games.concat(data));
        setOffset(offset + data.length);
        setFetchMoreLoading(false);
      })
      .catch((error) => {
        notification['error']({
          message: 'Registration Error!',
          description: error.message
        });
        setFetchMoreLoading(false);
      });
  };

  return (
    <>
      <Head>
        <title>The Daily Stakes - Yesterdays plays</title>
      </Head>
      <AppLayout token={token} subscriptions={subscriptions} bgColor={'#ffffff'}>
        <HeroBanner />
        <div className={styles.container}>
          {unlockedItems && sports.length > 0 && (
            <TopSection
              unlockedItems={unlockedItems}
              sports={sports}
              onSelectChange={updateFilters}
            />
          )}
        </div>
        <div className={styles.containerWrapper}>
          <div className={styles.container}>
            <Row className={styles.content}>
              <Col span={18} className={styles.contentMainCol}>
                {!token && <SubscribeNow />}
                {token && (
                  <>
                    <SportEntry loading={entireLoading} plays={games} />
                    <Row>
                      <Col span={24} className="text-center">
                        <Button
                          loading={fetchMoreLoading}
                          onClick={onLoadMore}
                          className={styles.loadMoreBtn}>
                          Load More
                        </Button>
                      </Col>
                    </Row>
                  </>
                )}
              </Col>
              <Col span={6} className={styles.contentSideCol}>
                <BankrollManagementSystem />
                <CommonSportsbooks />
                <BettingFundamentals />
              </Col>
            </Row>
          </div>
        </div>
      </AppLayout>
    </>
  );
}

function SubscribeNow() {
  const router = useRouter();
  const goSignUp = () => {
    router.push('/signup');
  };

  return (
    <div className={styles.subscribenow}>
      <div className={styles.subscribenow_container}>
        <div className={styles.subscribenow_left}>
          <LazyLoad height={140}>
            <img
              alt="Curve Arrow Icon"
              src="/images/curve_arrow.svg"
              className={styles.subscribenow_curve}
            />
          </LazyLoad>
          <div className={styles.subscribenow_desc}>
            Subscribe Now for Free & Join the Winning Team.
          </div>
        </div>
        <div className={styles.subscribenow_right}>
          <div className={styles.btn_circle}>
            <LazyLoad height={170}>
              <img alt="Subscribe Button Icon" src="/images/subscribe_btn_circle.svg" />
            </LazyLoad>
            <Button className={styles.subscribe_btn} onClick={goSignUp}>
              Subscribe Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BankrollManagementSystem() {
  return (
    <div className={styles.sidebarBlock}>
      <div className={styles.sidebarBlockTitle}>
        <MoneyPocketIcon className={styles.sidebarBlockTitleIcon} />
        <span>Bankroll Management System</span>
      </div>
      <div className={styles.sidebarBlockContent}>
        <Row className={styles.ctaBtns}>
          <Button className={styles.agressiveBtn}>Aggresive</Button>
          <Button ghost className={styles.conservativeBtn}>
            Conservative
          </Button>
        </Row>
        <p>1 unit = 2% Bankroll</p>
        <p>2 units = 4% Bankroll</p>
        <p>3 units = 6% Bankroll</p>
        <p>4 units = 8% Bankroll</p>
        <div className={styles.footer_desc}>
          The higher the unit the more confident I am in the play
        </div>
      </div>
    </div>
  );
}

function CommonSportsbooks() {
  return (
    <div className={styles.sidebarBlock}>
      <div className={styles.sidebarBlockTitle}>
        <OpenBookIcon className={styles.sidebarBlockTitleIcon} />
        <span>Common Sportsbooks</span>
      </div>
      <div className={styles.sidebarBlockContent}>
        <Row>
          <Col span={12} className={styles.company_logo}>
            <a href="https://www.bet365.com/#/HO/">
              <img src="/images/bet365.png" alt="Bet365 Logo" width={94} height={31} />
            </a>
          </Col>
          <Col span={12} className={styles.company_logo}>
            <a href="https://betway.com/">
              <img src="/images/betway.png" alt="Betway Logo" width={98} height={32} />
            </a>
          </Col>
          <Col span={12} className={styles.company_logo}>
            <a href="https://sportsbook.fanduel.com/">
              <img src="/images/fanduel.png" alt="Fanduel Logo" width={107} height={26} />
            </a>
          </Col>
          <Col span={12} className={styles.company_logo}>
            <a href="https://sportsbook.draftkings.com">
              <img
                src="/images/draftkings.png"
                alt="Draftkings SportsBook Logo"
                width={109}
                height={29}
              />
            </a>
          </Col>
          <Col span={12} className={styles.company_logo}>
            <a href="https://www.williamhill.com/us">
              <img
                src="/images/williamhill.png"
                alt="WilliamHill SportsBook Logo"
                width={120}
                height={34}
              />
            </a>
          </Col>
        </Row>
      </div>
    </div>
  );
}

const MOCK_BetFundaments = [
  {
    id: 1,
    title: 'Favorites vs. Underdogs',
    content:
      'Also known as bookies, are people who are licensed to create betting lines and take wagers. Our goal is to consistently out outperform the bookies by finding value picks for our clients.'
  },
  {
    id: 2,
    title: 'Oddsmakers',
    content:
      'Also known as bookies, are people who are licensed to create betting lines and take wagers. Our goal is to consistently out outperform the bookies by finding value picks for our clients.'
  },
  {
    id: 3,
    title: 'MoneyLine',
    content:
      'Also known as bookies, are people who are licensed to create betting lines and take wagers. Our goal is to consistently out outperform the bookies by finding value picks for our clients.'
  },
  {
    id: 4,
    title: 'Spreads',
    content:
      'Also known as bookies, are people who are licensed to create betting lines and take wagers. Our goal is to consistently out outperform the bookies by finding value picks for our clients.'
  },
  {
    id: 5,
    title: 'Over/Under Totals',
    content:
      'Also known as bookies, are people who are licensed to create betting lines and take wagers. Our goal is to consistently out outperform the bookies by finding value picks for our clients.'
  }
];

function BettingFundamentals() {
  const [showContent, setShowContent] = useState<boolean[]>([]);
  const toggleDetailsAt = (id: number) => {
    showContent[id] = !showContent[id];
    setShowContent(showContent.slice());
  };

  return (
    <div className={styles.sidebarBlock}>
      <div className={styles.sidebarBlockTitle}>
        <ListIcon className={styles.sidebarBlockTitleIcon} />
        <span>Sports Betting Fundamentals</span>
      </div>
      <div className={styles.sidebarBlockContent}>
        {MOCK_BetFundaments.map((data, index) => (
          <React.Fragment key={index}>
            <div className={styles.accordionTitle}>
              {showContent[index] && (
                <>
                  <strong>{data.title}</strong>
                  <Button ghost className={styles.ghostBtn} onClick={() => toggleDetailsAt(index)}>
                    <MinusEncloseIcon className={styles.accordionTitleIcon} />
                  </Button>
                </>
              )}
              {!showContent[index] && (
                <>
                  <span>{data.title}</span>
                  <Button ghost className={styles.ghostBtn} onClick={() => toggleDetailsAt(index)}>
                    <PlusEncloseIcon className={styles.accordionTitleIcon} />
                  </Button>
                </>
              )}
            </div>
            {showContent[index] && <div className={styles.accordionContent}>{data.content}</div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function HeroBanner() {
  return (
    <div className={styles.heroBanner}>
      <img src="/images/member_dashboard.jpg" className={styles.bgImage} />
      <BannerSportsAndMatches />
    </div>
  );
}

type TopSectionPropsType = {
  unlockedItems: number[];
  sports: Sport[];
  onSelectChange: (_: number, _status: boolean) => void;
};

function TopSection({ unlockedItems, sports, onSelectChange }: TopSectionPropsType) {
  const [sportsStatus, setSportsStatus] = useState<number[]>([]);

  useEffect(() => {
    const selectedStatus = sports.map((sport: Sport) => {
      const unlockedItemIndex = unlockedItems.findIndex((item: number) => item === sport.id);
      if (unlockedItemIndex > -1) {
        return 1;
      }
      return 0;
    });
    setSportsStatus(selectedStatus);
  }, [unlockedItems]);

  const onUnlockAll = () => {
    const newStatuses = sportsStatus.fill(1);
    console.log('---newStatuses:', newStatuses);
    setSportsStatus(newStatuses);
    onSelectChange(-1, false);
  };

  const onUnlockItemAt = (index: number) => {
    const items = sportsStatus.slice();
    if (items[index] === 1) {
      items.fill(1);
      items[index] = 2;
      setSportsStatus(items);
      onSelectChange(sports[index].id, true);
    } else if (items[index] === 2) {
      items.fill(1);
      items[index] = 1;
      setSportsStatus(items);
      onSelectChange(sports[index].id, false);
    }
  };

  const responsive = [
    {
      breakpoint: 1240,
      settings: {
        slidesToShow: 5,
        slidesToScroll: 1,
        dots: false,
        draggable: true
      }
    },
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 1,
        dots: false,
        draggable: true
      }
    },
    {
      breakpoint: 992,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
        dots: false,
        draggable: true
      }
    },
    {
      breakpoint: 520,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        dots: false,
        draggable: true
      }
    }
  ];

  return (
    <>
      <DashboardHeader title={'Yesterdays plays'} />
      <Row className={styles.sportsCardList} justify={'center'}>
        <Button className={styles.dropdownBtnWrapper} onClick={onUnlockAll}>
          <div className={`${styles.dropdownBtn} ${styles.dropdownBtnAll}`}>
            <span>All</span>
          </div>
        </Button>
        <div className={styles.sportsCardListCarousel}>
          <Carousel
            arrows={true}
            dots={false}
            slidesToShow={8}
            responsive={responsive}
            initialSlide={0}
            variableWidth
            infinite={false}
            draggable={false}
            swipeToSlide
            slidesToScroll={1}>
            {sports.map((sport: Sport, index: number) => (
              <div key={index}>
                <Button className={styles.dropdownBtnWrapper} onClick={() => onUnlockItemAt(index)}>
                  <div
                    className={`${styles.dropdownBtn} ${
                      styles[
                        'dropdown_' +
                          SPORTS_INFO.filter(
                            (sp) => sp.name.toUpperCase() === sport.name.toUpperCase()
                          )[0]?.id
                      ]
                    }`}
                    style={{
                      background:
                        sportsStatus[index] == 2
                          ? SPORTS_INFO.filter(
                              (sp) => sp.name.toUpperCase() === sport.name.toUpperCase()
                            )[0]?.background
                          : ''
                    }}>
                    {SPORTS_INFO.filter(
                      (sp) => sp.name.toUpperCase() === sport.name.toUpperCase()
                    )[0]?.logo()}
                    <span>{sport.name}</span>
                  </div>
                </Button>
              </div>
            ))}
          </Carousel>
        </div>
      </Row>
    </>
  );
}
