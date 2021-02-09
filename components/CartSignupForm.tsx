import React, { useState } from 'react';
import { Row, Col } from 'antd';

import { CreateUserType, CreateUserValidateType } from '@type/Users';
import { validateEmail } from '@utils/common';

import styles from './LoginModal.module.css';

type CartRegistration = {
  onCartLogin: () => void;
  signupFormChanged: (_: CreateUserType, _valid: boolean) => void;
};

export default function CartRegistration({ onCartLogin, signupFormChanged }: CartRegistration) {
  const [formData, setFormData] = useState<CreateUserType>({
    username: undefined,
    first_name: undefined,
    last_name: undefined,
    full_name: undefined,
    email: undefined,
    provider: undefined,
    mobile_number: undefined,
    password: undefined,
    verify_password: undefined
  });
  const [formValidation, setFormValidation] = useState<CreateUserValidateType>({
    username: true,
    first_name: true,
    last_name: true,
    email: true,
    password: true,
    verify_password: true
  });

  const changeFormData = (name: keyof CreateUserType, e: React.FormEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    const newFormData = Object.assign({}, formData);
    newFormData[name] = value;
    newFormData.full_name = newFormData.first_name + ' ' + newFormData.last_name;
    setFormData(newFormData);
    validateForm(newFormData);
  };
  const validateForm = (data: CreateUserType) => {
    const newValidation = Object.assign({}, formValidation);
    let isValid = true;
    if (data.first_name === '') {
      newValidation.first_name = false;
      isValid = false;
    } else if (data.first_name === undefined) {
      isValid = false;
    } else {
      newValidation.first_name = true;
    }
    if (data.last_name === '') {
      newValidation.last_name = false;
      isValid = false;
    } else if (data.last_name == undefined) {
      isValid = false;
    } else {
      newValidation.last_name = true;
    }
    if (data.username === '') {
      newValidation.username = false;
      isValid = false;
    } else if (data.username === undefined) {
      isValid = false;
    } else {
      newValidation.username = true;
    }
    if (data.email === '') {
      newValidation.email = false;
      isValid = false;
    } else if (data.email == undefined) {
      isValid = false;
    } else if (data.email !== '' && !validateEmail(data.email || '')) {
      newValidation.email = false;
      isValid = false;
    } else {
      newValidation.email = true;
    }
    if (data.verify_password !== data.password) {
      newValidation.verify_password = false;
      newValidation.password = false;
      isValid = false;
    } else if (data.password === '' || (data.password && data.password.length < 6)) {
      newValidation.password = false;
      isValid = false;
    } else if (data.password == undefined) {
      isValid = false;
    } else {
      newValidation.password = true;
    }
    if (data.verify_password === '') {
      newValidation.verify_password = false;
      isValid = false;
    } else if (data.verify_password == undefined) {
      isValid = false;
    } else {
      newValidation.verify_password = true;
    }
    console.log('--- newValidation', isValid);
    setFormValidation(newValidation);
    signupFormChanged(formData, isValid);
  };

  return (
    <div>
      <h2>Registration</h2>
      <Row align={'middle'} className={styles.register_row}>
        <span>Returning Customer?&nbsp;&nbsp;</span>
        <a onClick={onCartLogin}>Click here to login</a>
      </Row>
      <Row>
        <Col span={24} className={styles.formGroup}>
          <label>User Name*</label>
          <input
            name="username"
            className={formValidation.username ? '' : styles.error}
            placeholder="ie: CashmeOut91"
            onChange={(e) => changeFormData('username', e)}
          />
        </Col>
      </Row>
      <Row className={styles.rowWithTwoChild} justify="space-between">
        <Col span={12} className={styles.formGroup}>
          <label>First Name*</label>
          <input
            name="first_name"
            className={formValidation.first_name ? '' : styles.error}
            placeholder="ie: Johnny"
            onChange={(e) => changeFormData('first_name', e)}
          />
        </Col>
        <Col span={12} className={styles.formGroup}>
          <label>Last Name*</label>
          <input
            name="last_name"
            className={formValidation.last_name ? '' : styles.error}
            placeholder="ie: Cash"
            onChange={(e) => changeFormData('last_name', e)}
          />
        </Col>
      </Row>
      <Row>
        <Col span={24} className={styles.formGroup}>
          <label>Email*</label>
          <input
            name="email"
            className={formValidation.email ? '' : styles.error}
            type="email"
            placeholder="ie: j.cash@gmail.com"
            onChange={(e) => changeFormData('email', e)}
          />
        </Col>
      </Row>
      <Row>
        <Col span={24} className={styles.formGroup}>
          <label>Mobile Number</label>
          <input
            name="mobile_number"
            placeholder="1-111-111-1111"
            onChange={(e) => changeFormData('mobile_number', e)}
          />
        </Col>
      </Row>
      <Row className={styles.rowWithTwoChild} justify="space-between">
        <Col span={12} className={styles.formGroup}>
          <label>Password*</label>
          <input
            name="password"
            className={formValidation.password ? '' : styles.error}
            type="password"
            placeholder="ie: **********"
            onChange={(e) => changeFormData('password', e)}
          />
        </Col>
        <Col span={12} className={styles.formGroup}>
          <label>Verify Password*</label>
          <input
            name="verify_password"
            className={formValidation.verify_password ? '' : styles.error}
            type="password"
            placeholder="ie: **********"
            onChange={(e) => changeFormData('verify_password', e)}
          />
        </Col>
      </Row>
    </div>
  );
}
