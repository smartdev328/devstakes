import { BillingPlan } from "@type/Packages";

export function validateEmail(email: string) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

export function getDayOfWeek(date: Date) {
  const dayOfWeek = date.getDay();
  return isNaN(dayOfWeek)
    ? null
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
}

export function getMonthString(date: Date) {
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];

  return monthNames[date.getMonth()];
}

export function parseJwt(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );

  return JSON.parse(jsonPayload);
}

export function tokenAuthHeaders() {
  const token = localStorage.getItem('token') || '';
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

export const getDayPrice = (plan: BillingPlan) => {
  let dayPrice = plan.price;
  switch (plan.duration) {
    case 'DAILY':
      dayPrice = plan.price;
      break;
    case 'EVERY_3_DAYS':
      dayPrice = Math.round(plan.price / 3);
      break;
    case 'WEEKLY':
      dayPrice = Math.round(plan.price / 7);
      break;
    case 'MONTHLY':
      dayPrice = Math.round(plan.price / 30);
      break;
    case 'QUARTERLY':
      dayPrice = Math.round(plan.price / 90);
      break;
    case 'ANNUAL':
      dayPrice = Math.round(plan.price / 360);
      break;
    case 'SEMI_ANNUAL':
      dayPrice = Math.round(plan.price / 180);
      break;
    default:
  }
  return dayPrice;
};
