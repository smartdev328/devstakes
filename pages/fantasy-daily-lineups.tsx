/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable react/display-name */
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Row, Button, Col, Spin } from 'antd';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import LazyLoad from 'react-lazyload';
import NumberFormat from 'react-number-format';
import { useRouter } from 'next/router';
import Markdown from 'react-markdown';

import {
  AppLayout,
  DailyFantasyLineups,
  BannerSportsAndMatches,
  BettingFundamentals,
  CommonSportsBook,
  DashboardHeader,
  WhereToWatchGame,
  WhereBuyGear,
  VipAllAccessCard,
  BankRollManagement,
  LockFantasyCard
} from '@components/index';
import { AntiClockIcon, DateRangeIcon, LockIcon } from '@components/SvgIcons';
import styles from '@styles/FantasyDailyLineups.module.css';
import { DailyLineupType, PageProps, SportInfoType } from '@type/Main';
import {
  NBA_SVG,
  NFL_SVG,
  MLB_SVG,
  FanduelLogoSvg,
  DraftKingsLogoSvg,
  YahooFantasySVG
} from '@components/SportIcons';
import { FANTASY_TABS, PACKAGE_NAMES } from '@constants/';
import { FantasyTabInfo, Sport } from '@type/Sports';
import SportsAPIs from '@apis/sport.apis';

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
  }
];

export const FANTASY_COMPANIES = [
  {
    id: 'draft_kings',
    name: 'DraftKings',
    logo: () => <DraftKingsLogoSvg className={styles.fantasyCompanyLogo} />
  },
  {
    id: 'fanduel_company',
    name: 'Fanduel',
    logo: () => <FanduelLogoSvg className={styles.fantasyCompanyLogo} />
  },
  {
    id: 'yahoo_fantasy',
    name: 'Yahoo',
    logo: () => <YahooFantasySVG className={styles.fantasyCompanyLogo} />
  }
];

export default function FantasyDailyLineupsPage({ token, subscriptions, sports }: PageProps) {
  const [lineupList, setLineupList] = useState<DailyLineupType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedSport, setSelectedSport] = useState<string>('NBA');
  const [selectedCompany, setSelectedCompany] = useState<string>(FANTASY_COMPANIES[0].name);
  const [activeTab, setActiveTab] = useState<string>(FANTASY_TABS[0].id);
  const [infoForCurrentTab, setInfoForCurrentTab] = useState<FantasyTabInfo | undefined>(undefined);
  const [unlockedSports, setUnlockedSports] = useState<Sport[]>([]);
  const [lineupSalary, setLineupSalary] = useState<number>(0);
  const [showLockView, setShowLockView] = useState<boolean>(false);

  const router = useRouter();
  const { sport: querySport } = router.query;

  useEffect(() => {
    const items: Sport[] = [];
    subscriptions.forEach((subscription) => {
      if (subscription.plan.name.toUpperCase().indexOf(PACKAGE_NAMES.FANTASY) > -1) {
        items.push(subscription.sports[0]);
      }
    });
    items.sort((a, b) => {
      return a.id > b.id ? 1 : -1;
    });

    if (querySport) {
      setSelectedSport(querySport as string);
    } else if (items.length > 0) {
      setSelectedSport(items[0].name);
    }
    setUnlockedSports(items);
  }, [subscriptions]);

  useEffect(() => {
    setLoading(true);
    if (sports.length > 0 && subscriptions.length > 0) {
      const fantasySubscriptions = subscriptions.filter(
        (subscription) => subscription.plan.name.toUpperCase().indexOf(PACKAGE_NAMES.FANTASY) > -1
      );
      const sportIdx = sports.findIndex((sport) => sport.name === selectedSport);

      SportsAPIs.getFantasyParentEntries(sports[sportIdx].id, fantasySubscriptions)
        .then((res) => res.json())
        .then((data) => {
          const infos = data.filter(
            (info: FantasyTabInfo) =>
              info.sportsbooks === selectedCompany && info.tournament_type === activeTab
          );
          const parentID = infos[0]?.id;
          if (parentID) {
            SportsAPIs.getFantasyPlayerEntries(parentID)
              .then((res2) => res2.json())
              .then((entries) => {
                let total = 0;
                entries.forEach((entry: DailyLineupType) => {
                  total += entry.salary;
                });
                setInfoForCurrentTab(infos[0]);
                setLineupSalary(total);
                setLineupList(entries);
                setLoading(false);
              });
          } else {
            setInfoForCurrentTab(infos[0]);
            setLineupList([]);
            setLineupSalary(0);
            setLoading(false);
          }
        });
    }
  }, [selectedSport, selectedCompany, activeTab, sports, subscriptions]);

  const onChangeOptions = (sport: string, company: string, lineupType: string) => {
    setSelectedSport(sport);
    setSelectedCompany(company);
    setActiveTab(lineupType);
  };

  return (
    <>
      <Head>
        <title>TheDailyStakes - Daily Fantasy</title>
      </Head>
      <AppLayout token={token} subscriptions={subscriptions} bgColor={'#ffffff'}>
        <HeroBanner />
        <div className={styles.container}>
          <TopSection
            unlockedSports={unlockedSports}
            openUnlockModal={(sport, status) => {
              setShowLockView(status);
              setSelectedSport(sport);
            }}
            activeSport={selectedSport}
            activeTab={activeTab}
            lineupSalary={lineupSalary}
            selectedCompany={selectedCompany}
            infoForCurrentTab={infoForCurrentTab}
            onChangeOptions={onChangeOptions}
          />
        </div>

        <div className={styles.containerWrapper}>
          <div className={styles.container}>
            <Row className={styles.content}>
              <Col sm={24} md={18} className={styles.contentMainCol}>
                {showLockView ? (
                  <LockFantasyCard />
                ) : (
                  !loading && <LineupsList data={lineupList} selectedSport={selectedSport} />
                )}
                {loading && (
                  <div className={styles.loadingSpin}>
                    <Spin size="large" />
                  </div>
                )}
                <div className={styles.laptop_view}>
                  <CommonSportsBook />
                  <WhereToWatchGame />
                  <WhereBuyGear />
                  <BankRollManagement />
                  <BettingFundamentals />
                  <BettingFundamentals isFantasy />
                </div>
              </Col>
              <Col span={6} className={styles.contentSideCol}>
                <div className={styles.mobile_view}>
                  <FantasySidebar />
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </AppLayout>
    </>
  );
}

function HeroBanner() {
  return (
    <div className={styles.heroBanner}>
      {/* <img src="/images/trianglebanner.jpg" className={styles.bgImage} /> */}
      <BannerSportsAndMatches />
    </div>
  );
}

type TopSectionPropsType = {
  unlockedSports: Sport[];
  activeSport: string;
  selectedCompany: string;
  activeTab: string;
  infoForCurrentTab: FantasyTabInfo | undefined;
  lineupSalary: number;
  openUnlockModal: (sport: string, _: boolean) => void;
  onChangeOptions: (sport: string, company: string, lineupType: string) => void;
};

function TopSection({
  unlockedSports,
  openUnlockModal,
  onChangeOptions,
  activeSport,
  selectedCompany,
  activeTab,
  infoForCurrentTab,
  lineupSalary
}: TopSectionPropsType) {
  const [sportsStatus, setSportsStatus] = useState<number[]>([]);

  useEffect(() => {
    initStatus();
  }, [unlockedSports]);

  const initStatus = () => {
    const selectedStatus = SPORTS_INFO.map((sport: SportInfoType) => {
      const unlockedItemIndex = unlockedSports.findIndex((item: Sport) => item.name === sport.name);
      if (unlockedItemIndex > -1) {
        if (activeSport === sport.name) {
          return 2;
        }
        return 1;
      }
      return 0;
    });
    setSportsStatus(selectedStatus);
  };

  const onUnlockItemAt = (index: number) => {
    const items = sportsStatus.slice();
    if (items[index] === 1) {
      const newItems = items.map((item, idx) => {
        if (item > 0) {
          if (idx === index) {
            return 2;
          }
          return 1;
        }
        return 0;
      });
      setSportsStatus(newItems);
      onChangeOptions(SPORTS_INFO[index].name, FANTASY_COMPANIES[0].name, FANTASY_TABS[0].id);
      openUnlockModal(SPORTS_INFO[index].name, false);
    } else if (items[index] !== 2) {
      const newItems = items.map((item) => {
        if (item === 2) {
          return 1;
        }
        return item;
      });
      setSportsStatus(newItems);
      openUnlockModal(SPORTS_INFO[index].name, true);
    }
  };
  const onSelectCompany = (name: string) => {
    onChangeOptions(activeSport, name, FANTASY_TABS[0].id);
  };
  const changeTab = (tab: string) => {
    onChangeOptions(activeSport, selectedCompany, tab);
  };

  return (
    <>
      <DashboardHeader title={'DAILY FANTASY CARD'} />
      <Row className={styles.sportsCardList} justify={'center'}>
        <div className={styles.laptop_view}>
          <VipAllAccessCard />
          <DailyFantasyLineups />
        </div>
        <div className={styles.sportsCardListCarousel}>
          {SPORTS_INFO.map((sport: SportInfoType, index: number) => (
            <Button
              key={index}
              className={styles.dropdownBtnWrapper}
              onClick={() => onUnlockItemAt(index)}>
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
                    sportsStatus[index] === 2 || activeSport === sport.name
                      ? SPORTS_INFO.filter(
                          (sp) => sp.name.toUpperCase() === sport.name.toUpperCase()
                        )[0]?.background
                      : ''
                }}>
                {sport.logo()}
                {!sportsStatus[index] && <LockIcon className={styles.lock_icon} />}
                <span>{sport.name}</span>
              </div>
            </Button>
          ))}
        </div>
      </Row>
      <Row className={styles.optionsRow} align={'middle'} wrap={false} justify={'space-between'}>
        <Row align={'middle'} style={{ flex: 1 }}>
          <Col span={24} className={styles.sectionTitle}>
            Select Sportsbook
          </Col>
          {FANTASY_COMPANIES.map((company) => (
            <LazyLoad key={company.id}>
              <div className={styles.sportsbook}>
                <div className={styles.sportsbook_name}>{company.name}</div>
                <div
                  className={`${styles.sportsbook_logo} ${styles[`${company.id}`]} ${
                    selectedCompany === company.name && styles.selected
                  }`}
                  onClick={() => onSelectCompany(company.name)}>
                  {company.logo()}
                </div>
              </div>
            </LazyLoad>
          ))}
          <Col span={24} className={styles.sectionTitle} style={{ marginTop: '1em' }}>
            Select Game Style
          </Col>
          {FANTASY_TABS.map((tab) => (
            <div
              key={tab.id}
              className={`${styles.fantasy_tab} ${activeTab === tab.id && styles.selected}`}
              onClick={() => changeTab(tab.id)}>
              {tab.name}
            </div>
          ))}
        </Row>
        <Row align={'middle'}>
          <span className={styles.financialValues}>
            Salary Cap:&nbsp;
            <NumberFormat
              displayType="text"
              thousandSeparator={true}
              prefix={'$'}
              key={infoForCurrentTab?.total_salary}
              value={infoForCurrentTab?.total_salary || 0}
            />
          </span>
          <span className={styles.financialValues}>
            Lineup Salary:&nbsp;
            <NumberFormat
              displayType="text"
              key={lineupSalary}
              thousandSeparator={true}
              prefix={'$'}
              value={lineupSalary || 0}
            />
          </span>
        </Row>
      </Row>
      <Row>
        <Col span={18}>
          <p className={styles.fantasyLineupInfo}>
            TheDailyStakes proposed Bankroll Allocation Based on Contest Types
          </p>
        </Col>
        <Col span={18} style={{ marginBottom: '1em' }}>
          <Row align="middle" justify="space-between" className={styles.fantasyStats}>
            <div className={styles.featureValue}>
              <Markdown source={infoForCurrentTab?.stat.tournament || ''} />
            </div>
            <div className={styles.featureValue}>
              <Markdown source={infoForCurrentTab?.stat.beat_the_score || ''} />
            </div>
            <div className={styles.featureValue}>
              <Markdown source={infoForCurrentTab?.stat.fifty_to_fifty || ''} />
            </div>
          </Row>
        </Col>
      </Row>
    </>
  );
}

function LineupsList({ data, selectedSport }: { data: DailyLineupType[]; selectedSport: string }) {
  const [showDetailsAt, setShowDetailsAt] = useState<boolean[]>([]);
  const changeDetailsVisibleAt = (index: number) => {
    showDetailsAt[index] = !showDetailsAt[index];
    setShowDetailsAt(showDetailsAt.slice());
  };

  const getPosition = (lineup: DailyLineupType) => {
    let lineupPosition;
    switch (lineup.position) {
      case 'B1':
        lineupPosition = '1B';
        break;
      case 'B2':
        lineupPosition = '2B';
        break;
      case 'B3':
        lineupPosition = '3B';
        break;
      default:
        lineupPosition = lineup.position;
    }
    return lineupPosition;
  };

  return (
    <div className={styles.daily_lineups}>
      {data.length === 0 && <div className={styles.noData}>No Data</div>}
      {data.map((lineup: DailyLineupType, index: number) => (
        <div className={styles.daily_lineup} key={lineup.id}>
          <Row>
            <div className={styles.daily_lineup_sidebar}>
              <LazyLoad>
                {selectedSport === 'NBA' ? (
                  <NBA_SVG className={styles.daily_lineup_sidebar_bg} />
                ) : selectedSport === 'NFL' ? (
                  <NFL_SVG className={styles.image_NFL} />
                ) : (
                  <MLB_SVG className={styles.image_MLB} />
                )}
              </LazyLoad>
              <div className={styles.daily_lineup_sidebar_content}>
                <span>{getPosition(lineup)}</span>
                <div className={styles.divider} />
                <LazyLoad>
                  <img src={lineup.team.logo.url} alt="Daily Lineup Logo" />
                </LazyLoad>
              </div>
            </div>
            <div className={styles.daily_lineup_main}>
              <div className={styles.daily_lineup_main_content}>
                <h4>{lineup.name}</h4>
                <div>
                  <strong
                    className={
                      styles.daily_lineup_teams
                    }>{`${lineup.schedule?.home_team?.name}@${lineup.schedule?.team?.name}`}</strong>
                  <div>
                    <span>FPPG:&nbsp;</span>
                    <strong>{lineup.ffpg}</strong>
                    <span>oprk:&nbsp;</span>
                    <strong>{lineup.oprk}</strong>
                    <span>Games Played:&nbsp;</span>
                    <strong>{lineup.games_played}</strong>
                  </div>
                </div>
              </div>
              <div className={styles.daily_lineup_value}>
                <NumberFormat
                  displayType="text"
                  thousandSeparator={true}
                  prefix={'$'}
                  value={lineup.salary}
                />
              </div>
            </div>
          </Row>
          {lineup?.stat ? (
            <div className={styles.daily_lineup_details}>
              <div onClick={() => changeDetailsVisibleAt(index)} className={styles.hide_details}>
                <div className={styles.hide_details_btn}>
                  <span>View details</span>
                  {showDetailsAt[index] && <CaretUpOutlined className={styles.caret_up} />}
                  {!showDetailsAt[index] && <CaretDownOutlined className={styles.caret_down} />}
                </div>
              </div>
              {showDetailsAt[index] && (
                <Row className={styles.details_properties} justify={'space-between'}>
                  {lineup?.stat?.this_season && (
                    <div className={styles.details_property}>
                      <div className={styles.details_property_title}>
                        <AntiClockIcon className={styles.anti_clock_icon} />
                        <span>THIS SEASON</span>
                      </div>
                      <Markdown source={lineup?.stat?.this_season} />
                    </div>
                  )}
                  {lineup?.stat?.projected_points && (
                    <div className={styles.details_property}>
                      <div className={styles.details_property_title}>
                        <div>
                          <img
                            alt=""
                            src="/images/user-double.png"
                            className={styles.user_double_icon}
                          />
                        </div>
                        <span>PROJECTED POINTS BY THE DAILY STAKES </span>
                      </div>
                      <Markdown source={lineup?.stat?.projected_points} />
                    </div>
                  )}
                  {lineup?.stat?.player_props && (
                    <div className={styles.details_property}>
                      <div className={styles.details_property_title}>
                        <DateRangeIcon className={styles.date_range_icon} />
                        <span>PLAYER PROPS BY THE Sportbooks</span>
                      </div>
                      <Markdown source={lineup?.stat?.player_props} />
                    </div>
                  )}
                </Row>
              )}
            </div>
          ) : (
            <div className={styles.border_line} />
          )}
        </div>
      ))}
    </div>
  );
}

function FantasySidebar() {
  return (
    <>
      <VipAllAccessCard />
      <DailyFantasyLineups />
      <CommonSportsBook />
      <WhereToWatchGame />
      <WhereBuyGear />
      <BankRollManagement />
      <BettingFundamentals />
      <BettingFundamentals isFantasy />
    </>
  );
}
