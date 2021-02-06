/* eslint-disable react/display-name */
import React, { FormEvent, useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Button, Dropdown, Menu, notification, Spin } from 'antd';
import LazyLoad from 'react-lazyload';
import { useSelector, useDispatch } from 'react-redux';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import { useStripe, useElements, CardNumberElement } from '@stripe/react-stripe-js';

import {
  AppLayout,
  BannerSportsAndMatches,
  CartBillingInfo,
  CartLoginForm,
  CartSignupForm
} from '@components/index';
import styles from '@styles/Cart.module.css';
import { CartItem } from '@type/Cart';
import PackageAPIs from '@apis/package.apis';
import { PageProps } from '@type/Main';
import { BillingPlan, Package } from '@type/Packages';
import { ReduxState } from '@redux/reducers';
import SubscriptionsApis from '@apis/subscriptions.apis';
import { MinusIcon } from '@components/SvgIcons';
import UsersAPIs from '@apis/user.apis';
import { UserBillingInfo } from '@type/Users';

function HeroBanner() {
  return (
    <div className={styles.heroBanner}>
      <LazyLoad>
        <img src="/images/cart_page_bg.png" className={styles.bgImage} />
      </LazyLoad>
      <div className={styles.heroBannerContent}>
        <h1>The Cart</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </div>
      <BannerSportsAndMatches />
    </div>
  );
}

type CartTotalWidgetProps = {
  mobile: boolean;
  loading: boolean;
  cartItems: CartItem[];
  onCheckout: () => void;
};

function CartTotalWidget({ loading, cartItems, mobile, onCheckout }: CartTotalWidgetProps) {
  const [showDetails, setShowDetails] = useState<boolean>(false);

  let totalPrice = 0;
  cartItems.forEach((item) => {
    totalPrice += item.plan.price;
  });
  return (
    <div className={`${styles.totalPriceWidget} ${mobile && styles.isMobileVisible}`}>
      <LazyLoad>
        <img src="/images/All-sports-bg.svg" alt="Total Price Widget background" />
      </LazyLoad>
      <div className={styles.totalPriceWidgetContent}>
        <h5>Cart Totals</h5>
        <div className={styles.totalCount}>
          {cartItems.length > 0 ? `${cartItems.length} Items` : 'No Items'}
        </div>
        <div className={styles.totalPrice}>{`$${totalPrice}.00`}</div>
        <div className={styles.discountRow}>
          <span>Discount:</span>
          <span>N/A</span>
        </div>
        <div className={styles.couponRow}>
          <input placeholder="Enter Coupon Code" />
          <Button disabled className={styles.couponBtn}>
            Apply Coupon
          </Button>
        </div>
        <Button
          loading={loading}
          disabled={cartItems.length === 0}
          className={styles.checkoutBtn}
          onClick={onCheckout}>
          Proceed to Checkout
        </Button>
      </div>
      <div className={styles.totalPriceWidgetContentMobile}>
        {showDetails && <h5>Cart Totals</h5>}
        <div className={styles.priceRow}>
          <div className={styles.totalCount}>{cartItems.length} Items</div>
          <div className={styles.totalPrice}>
            <span>{`$${totalPrice}.00`}</span>
            {!showDetails && (
              <CaretUpOutlined className={styles.caret_up} onClick={() => setShowDetails(true)} />
            )}
            {showDetails && (
              <CaretDownOutlined
                className={styles.caret_down}
                onClick={() => setShowDetails(false)}
              />
            )}
          </div>
        </div>
        {showDetails && (
          <>
            <div className={styles.discountRow}>
              <span>Discount:</span>
              <span>N/A</span>
            </div>
          </>
        )}
        <div className={styles.couponRow}>
          <input placeholder="Enter Coupon Code" />
          <Button disabled className={styles.couponBtn}>
            Apply Coupon
          </Button>
        </div>
        <Button
          loading={loading}
          disabled={cartItems.length === 0}
          className={styles.checkoutBtn}
          onClick={onCheckout}>
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}

function PlanDropdown({
  pack,
  selectedPlan,
  changePlan
}: {
  pack: Package;
  selectedPlan: BillingPlan;
  changePlan: (plan: BillingPlan) => void;
}) {
  const [packTypeMenuOpen, setPackTypeMenuOpen] = useState<boolean>(false);
  const [tempPlan, setTempPlan] = useState<BillingPlan>(selectedPlan);

  const billingPlans = pack.billing_plans.filter((plan) => plan.description !== 'add-on');

  const PackTypeMenu = () => (
    <Menu className={styles.sportMenu}>
      {billingPlans.map((plan: BillingPlan, index: number) => (
        <Menu.Item
          key={index}
          className={styles.sportMenuItem}
          onClick={() => {
            setPackTypeMenuOpen(false);
            setTempPlan(plan);
            changePlan(plan);
          }}>
          {`${plan.name}`}
        </Menu.Item>
      ))}
    </Menu>
  );

  const changePackMenuVisible = (status: boolean) => {
    setPackTypeMenuOpen(status);
  };

  return (
    <Dropdown
      overlay={PackTypeMenu}
      onVisibleChange={changePackMenuVisible}
      placement="bottomLeft"
      transitionName=""
      trigger={['click']}>
      <div className={styles.optionBtn}>
        <span>{tempPlan?.name}</span>
        {packTypeMenuOpen && <CaretUpOutlined className={styles.caret_up} />}
        {!packTypeMenuOpen && <CaretDownOutlined className={styles.caret_down} />}
      </div>
    </Dropdown>
  );
}

export default function Cart({ packages, token, subscriptions }: PageProps) {
  const { items: cartItems } = useSelector((state: ReduxState) => state.cart);
  const [tempCartItems, setTempCartItems] = useState<CartItem[]>([]);
  const [proceeding, setProceeding] = useState<boolean>(false);
  const [formView, setFormView] = useState<string>('');
  const [billingInfo, setBillingInfo] = useState<UserBillingInfo>({
    city: undefined,
    address: undefined,
    zipcode: undefined,
    full_name: undefined,
    country: undefined
  });
  const [isSavingCardInfo, setIsSavingCardInfo] = useState<boolean>(false);

  const router = useRouter();
  const dispatch = useDispatch();
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    setTempCartItems(cartItems);
  }, [cartItems]);

  const removeCartAt = (index: number) => {
    const updated = tempCartItems.slice();
    updated.splice(index, 1);
    setTempCartItems(updated);
  };
  const changedPlan = (index: number, plan: BillingPlan) => {
    const updated = tempCartItems.slice();
    updated[index].plan = plan;
    setTempCartItems(updated);
  };

  const proceedCheckout = () => {
    setProceeding(true);
    const promiseArr: Promise<Response>[] = [];
    tempCartItems.forEach((item) => {
      // Add To Subscriptions
      const promise = SubscriptionsApis.addSubscription({
        plan_id: item.plan.id,
        sports: item.sports !== undefined ? [item.sports.id] : []
      }).then((res) => res.json());
      promiseArr.push(promise);
    });
    Promise.all(promiseArr)
      .then(() => {
        setProceeding(false);
        setTempCartItems([]);
        dispatch({ type: 'UPDATE_CART', payload: [] });
        router.push('/member-dashboard');
      })
      .catch((error) => {
        setProceeding(false);
        notification['error']({
          message: 'Checkout Error!',
          description: error.message
        });
      });
  };

  const updateBillingForm = (name: keyof UserBillingInfo, e: React.FormEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    const newBillingInfo = Object.assign({}, billingInfo);
    newBillingInfo[name] = value;
    setBillingInfo(newBillingInfo);
  };
  const updateCardForm = async (event: FormEvent<HTMLFormElement>) => {
    // Block native form submission.
    event.preventDefault();
    setIsSavingCardInfo(true);

    if (!stripe || !elements) {
      console.error('Stripe is not loaded');
      return;
    }

    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const cardNumberElement = elements.getElement(CardNumberElement);

    // Use your card Element with other Stripe.js APIs
    if (cardNumberElement) {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumberElement,
        billing_details: {
          name: billingInfo.full_name,
          address: {
            city: billingInfo.city,
            country: billingInfo.country,
            line1: billingInfo.address,
            postal_code: billingInfo.zipcode
          }
        }
      });
      if (!paymentMethod) {
        console.log('[error]', error);
      } else {
        await UsersAPIs.addPaymentMethod({ payment_method_id: paymentMethod.id })
          .then((res) => res.json())
          .then((data) => {
            if (data.status === 'success') {
              notification['info']({
                message: 'New Payment Method has been Added!'
              });
              setFormView('');
            } else {
              notification['error']({
                message: 'Add New Payment Method Error',
                description: data.message
              });
            }
          })
          .catch((error) => {
            notification['error']({
              message: 'Add New Payment Method Error',
              description: error.message
            });
          });
      }
    } else {
      console.log('[error] Card Element is not rendered');
    }
    setIsSavingCardInfo(false);
  };

  return (
    <>
      <Head>
        <title>The Daily Stakes - Cart</title>
      </Head>
      <AppLayout token={token} subscriptions={subscriptions} bgColor={'#ffffff'}>
        <HeroBanner />
        <div className={styles.container}>
          {proceeding && (
            <div className={styles.containerLoadingWrapper}>
              <Spin size="large" />
            </div>
          )}
          <section className={styles.cartItemsSection}>
            {token && formView === '' && (
              <div className={styles.cartItems}>
                {tempCartItems.length === 0 && (
                  <p className={styles.noCart}>
                    <em>Cart is empty</em>
                  </p>
                )}
                {tempCartItems.map((item, index) => (
                  <div key={index} className={styles.cartItemWrapper}>
                    <div className={styles.cartItem}>
                      <div className={styles.cartItemMain}>
                        <img
                          src={item.sports?.logo || 'https://via.placeholder.com/100'}
                          alt={item.sports?.name}
                        />
                        <div className={styles.cartItemInfo}>
                          <span className={styles.cartItemName}>{item.pack.name}</span>
                          <span className={styles.cartItemDesc}>
                            {item.pack.name.indexOf('VIP All Access') > -1
                              ? 'All Sports'
                              : item.sports?.name}
                          </span>
                        </div>
                      </div>
                      <div className={styles.cartItemPlans}>
                        <div className={styles.cartItemPlansContent}>
                          {packages?.map((pack, idx: number) => (
                            <React.Fragment key={idx}>
                              {pack.id === item.plan.package && pack.description !== 'add-on' && (
                                <PlanDropdown
                                  pack={pack}
                                  selectedPlan={item.plan}
                                  changePlan={(plan) => changedPlan(index, plan)}
                                />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                      <div className={styles.cartItemPrice}>{`$${item.plan.price}.00`}</div>
                      <Button
                        type={'link'}
                        className={styles.removeCartBtn}
                        icon={<MinusIcon className={styles.minusIcon} />}
                        onClick={() => removeCartAt(index)}></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!token && (
              <>
                {formView === '' && (
                  <CartSignupForm
                    onAddBillingInfo={() => setFormView('BillingInfo')}
                    onCartLogin={() => setFormView('Login')}
                  />
                )}
                {formView === 'Login' && (
                  <CartLoginForm
                    onLoginCompleted={() => setFormView('BillingInfo')}
                    onCartSignup={() => setFormView('')}
                  />
                )}
              </>
            )}
            {token && formView === 'BillingInfo' && (
              <CartBillingInfo
                changeCardFormData={updateCardForm}
                changeBillingFormData={updateBillingForm}
                loading={isSavingCardInfo}
              />
            )}
            <CartTotalWidget
              mobile={false}
              loading={proceeding}
              cartItems={tempCartItems}
              onCheckout={proceedCheckout}
            />
          </section>
          <section className={styles.promoCodeSection}>
            <LazyLoad>
              <img
                className={styles.promoCodeBg}
                src="/images/promo_code_section_bg.jpg"
                alt="PromoCode Section Background"
              />
            </LazyLoad>
            <div className={styles.promoCodeWrapper}>
              <div className={styles.descCol}>
                <div className={styles.value}>Save 25%</div>
                <div className={styles.offerDetails}>Limited time offer. One time use only.</div>
              </div>
              <div className={styles.promoCode}>
                <span>Promo Code: Daily-1234</span>
                <LazyLoad>
                  <img src="/images/promo_card_bg.svg" alt="Promo code Wrapper Image" />
                </LazyLoad>
              </div>
            </div>
          </section>
          <CartTotalWidget
            mobile={true}
            loading={proceeding}
            cartItems={tempCartItems}
            onCheckout={proceedCheckout}
          />
        </div>
      </AppLayout>
    </>
  );
}

export async function getStaticProps() {
  const res = await PackageAPIs.getPackages();
  const packages = await res.json();

  return {
    props: {
      packages
    }
  };
}
