import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet, Image,
  Linking, BackHandler, KeyboardAvoidingView, Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

/* =========================================================
   Pawsitive Pet Academy: mobile app
   1. Data and helpers      4. Screens
   2. Validation            5. App shell (header, tabs, drop-down)
   3. Small components      6. Styles
   ========================================================= */

// ---------- 1. Data and helpers ----------
const C = {
  deep: '#0B5E5E', teal: '#0F7C7C', coral: '#F4A259', cream: '#FAF6F0', ink: '#2F2F2F',
  line: '#E4DCCF', muted: '#555555', error: '#C0392B', errorBg: '#FDE8E4', errorInk: '#7A1F14', okBg: '#E3F4EE',
};

// Array of course objects (same data as the website)
const courses = [
  { n: 'Canine Obedience Training', fee: 1500, t: 'long', e: '🐕', p: 'To teach effective dog obedience and behavioural training techniques.', c: ['Basic commands', 'Leash training', 'Behaviour correction', 'Positive reinforcement', 'Socialisation techniques'] },
  { n: 'Pet Grooming', fee: 1500, t: 'long', e: '✂️', p: 'To provide professional grooming skills for domestic pets.', c: ['Coat care', 'Bathing techniques', 'Nail trimming', 'Ear and eye cleaning', 'Grooming equipment'] },
  { n: 'Animal Behaviour', fee: 1500, t: 'long', e: '🐈', p: 'To understand common pet behaviours and improve communication with animals.', c: ['Animal psychology', 'Reading body language', 'Stress management', 'Behaviour modification', 'Enrichment activities'] },
  { n: 'Pet Business Management', fee: 1500, t: 'long', e: '💼', p: 'To prepare learners to operate a successful pet-related business.', c: ['Customer service', 'Marketing', 'Business planning', 'Financial management', 'Legal requirements'] },
  { n: 'Puppy Care', fee: 750, t: 'short', e: '🐶', p: 'To provide new puppy owners with essential care knowledge.', c: ['Feeding', 'Vaccinations', 'Toilet training', 'Exercise', 'Socialisation'] },
  { n: 'Pet First Aid', fee: 750, t: 'short', e: '🩹', p: 'To provide emergency first aid knowledge for pets.', c: ['Minor injuries', 'CPR basics', 'Poison awareness', 'Heatstroke', 'Emergency transport'] },
  { n: 'Basic Dog Walking', fee: 750, t: 'short', e: '🦮', p: 'To teach safe and professional dog walking practices.', c: ['Walking equipment', 'Handling multiple dogs', 'Safety procedures', 'Exercise routines'] },
];
const TYPE_LABEL = { long: 'Six-month programme', short: 'Six-week short course' };
const intakes = ['January', 'April', 'July', 'October'];
const TIERS = [[1, 0], [2, 5], [3, 10], [4, 15]];   // [minimum courses, % discount]
const VAT_RATE = 15;
const tabs = [['home', 'Home', '🏠'], ['about', 'About', 'ℹ️'], ['courses', 'Courses', '📚'], ['fees', 'Fees', '🧮'], ['contact', 'Contact', '📞']];
const MAP_URL = 'https://www.openstreetmap.org/export/embed.html?bbox=30.95%2C-29.92%2C31.10%2C-29.80&layer=mapnik';

// Money is kept in whole cents so every line of the quote adds up exactly.
const R = (cents) => {
  const a = Math.abs(Math.round(cents));
  const rands = String(Math.floor(a / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (cents < 0 ? '-' : '') + 'R' + rands + '.' + String(a % 100).padStart(2, '0');
};
const rand = (n) => R(n * 100);
const discountFor = (count) => TIERS.reduce((pct, [min, p]) => (count >= min ? p : pct), 0);

function buildQuote(indexes) {
  const pct = discountFor(indexes.length);
  const sub = indexes.reduce((s, i) => s + courses[i].fee * 100, 0);
  const disc = Math.round((sub * pct) / 100);
  const after = sub - disc;
  const vat = Math.round((after * VAT_RATE) / 100);
  return { count: indexes.length, pct, sub, disc, after, vat, total: after + vat };
}

// ---------- 2. Validation (same rules as the website) ----------
// Normalise a South African number: strip spaces, dashes and brackets, turn +27 / 27 into 0.
function cleanPhone(v) {
  let p = v.replace(/[\s\-().]/g, '');
  if (/^\+27\d{9}$/.test(p)) p = '0' + p.slice(3);
  else if (/^27\d{9}$/.test(p)) p = '0' + p.slice(2);
  return p;
}
const tidy = (v) => v.trim().replace(/\s+/g, ' ');
const RULES = {
  name: (v) => {
    v = tidy(v);
    if (!v) return 'Enter your name.';
    if (/\d/.test(v)) return 'Your name cannot contain numbers.';
    if (!/^\p{L}[\p{L}\p{M} '’-]*\p{L}\p{M}*$/u.test(v)) return 'Use letters only (at least two). Spaces, hyphens and apostrophes are fine.';
    return '';
  },
  phone: (v) => {
    if (!v.trim()) return 'Enter your phone number.';
    if (/[a-z]/i.test(v)) return 'A phone number cannot contain letters.';
    if (!/^0\d{9}$/.test(cleanPhone(v))) return 'Enter a 10-digit South African number, like 082 123 4567 or +27 82 123 4567.';
    return '';
  },
  email: (v) => {
    v = v.trim();
    if (!v) return 'Enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email address, like name@example.com.';
    return '';
  },
  intake: (v) => (v ? '' : 'Choose a preferred intake from the drop-down.'),
  courses: (list) => (list.length ? '' : 'Tick at least one course.'),
};
const FIELD_LABEL = { name: 'Name', phone: 'Phone number', email: 'Email address', intake: 'Preferred intake', courses: 'Courses' };

// ---------- 3. Small components (defined outside App so they keep their state) ----------
const Card = ({ children, style }) => <View style={[s.card, style]}>{children}</View>;
const Hero = ({ e, warm, label }) => (
  <View style={[s.pic, warm && s.picWarm]} accessible accessibilityRole="image" accessibilityLabel={label}>
    <Text style={s.picE}>{e}</Text>
  </View>
);
const Btn = ({ title, onPress, alt, label }) => (
  <TouchableOpacity style={[s.btn, alt && s.btnAlt]} onPress={onPress} accessibilityRole="button" accessibilityLabel={label || title} activeOpacity={0.8}>
    <Text style={[s.btnT, alt && s.btnTAlt]}>{title}</Text>
  </TouchableOpacity>
);
const H1 = ({ children }) => <Text style={s.h1} accessibilityRole="header">{children}</Text>;
const H2 = ({ children, style }) => <Text style={[s.h2, style]} accessibilityRole="header">{children}</Text>;
const Bullet = ({ children }) => <Text style={s.p}>{'•  '}{children}</Text>;
const FieldError = ({ msg }) => (msg ? <Text style={s.fieldErr} accessibilityLiveRegion="polite">{msg}</Text> : null);
function Table({ head, rows, total }) {
  return (
    <View style={s.table}>
      {head && (
        <View style={[s.tr, s.th]}>
          {head.map((h, k) => <Text key={h} style={[k ? s.tdR : s.td, s.thT]}>{h}</Text>)}
        </View>
      )}
      {rows.map((r, k) => {
        const isTotal = total && k === rows.length - 1;
        return (
          <View key={r[0] + k} style={[s.tr, k % 2 === 1 && s.trAlt, isTotal && s.trTotal]}>
            {r.map((cell, ci) => (
              <Text key={ci} style={[ci ? s.tdR : s.td, isTotal && s.bold]}>{cell}</Text>
            ))}
          </View>
        );
      })}
    </View>
  );
}

// One labelled text box with live error clearing
function Field({ name, form, fieldErr, setField, setFieldErr, inputRef, ...extra }) {
  return (
    <TextInput
      ref={inputRef}
      style={[s.input, fieldErr[name] ? s.inputBad : null]}
      value={form[name]}
      onChangeText={(v) => setField(name, v)}
      onBlur={() => form[name] && setFieldErr((f) => ({ ...f, [name]: RULES[name](form[name]) }))}
      placeholderTextColor="#8A8A8A"
      accessibilityLabel={FIELD_LABEL[name]}
      accessibilityHint={fieldErr[name] || undefined}
      {...extra}
    />
  );
}

// ---------- Fees screen (its own component so text boxes keep focus while typing) ----------
function FeesScreen({ form, fieldErr, setField, setFieldErr, selected, toggle, menuOpen, openMenu, errors, quote, done, onCalculate, onBook, scrollTo }) {
  const phoneRef = useRef(null);
  const emailRef = useRef(null);
  const msgY = useRef(0);
  const showMessage = () => setTimeout(() => scrollTo(msgY.current - 12), 60);

  const field = { form, fieldErr, setField, setFieldErr };

  return (<>
    <H1>Calculate total fees</H1>
    <Text style={s.p}>{"Tell us who you are, tick the courses you want, and we'll show a quote. This is a quote only, not an invoice."}</Text>

    <Text style={s.lbl}>Name</Text>
    <Field name="name" {...field} placeholder="Full name" autoComplete="name" textContentType="name" maxLength={60} returnKeyType="next" submitBehavior="submit" onSubmitEditing={() => phoneRef.current?.focus()} />
    <FieldError msg={fieldErr.name} />

    <Text style={s.lbl}>Phone number</Text>
    <Field name="phone" {...field} inputRef={phoneRef} placeholder="082 123 4567" keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" maxLength={20} returnKeyType="next" submitBehavior="submit" onSubmitEditing={() => emailRef.current?.focus()} />
    <Text style={s.hint}>South African number, for example 082 123 4567 or +27 82 123 4567.</Text>
    <FieldError msg={fieldErr.phone} />

    <Text style={s.lbl}>Email address</Text>
    <Field name="email" {...field} inputRef={emailRef} placeholder="name@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" maxLength={80} returnKeyType="done" />
    <FieldError msg={fieldErr.email} />

    <Text style={s.lbl}>Preferred intake</Text>
    <TouchableOpacity style={[s.input, s.select, fieldErr.intake ? s.inputBad : null]} onPress={openMenu} accessibilityRole="combobox" accessibilityLabel={`Preferred intake, ${form.intake || 'not chosen'}`} aria-expanded={menuOpen}>
      <Text style={form.intake ? s.selectT : s.placeholder}>{form.intake || 'Choose an intake'}</Text>
      <Text style={s.caret}>▾</Text>
    </TouchableOpacity>
    <FieldError msg={fieldErr.intake} />

    <Text style={s.lbl}>Select courses</Text>
    <View style={[s.chkList, fieldErr.courses ? s.chkBad : null]}>
      {courses.map((c, i) => {
        const on = selected.includes(i);
        return (
          <TouchableOpacity key={c.n} style={s.chk} onPress={() => toggle(i)} accessibilityRole="checkbox" aria-checked={on} accessibilityLabel={`${c.n}, ${rand(c.fee)}`}>
            <View style={[s.box, on && s.boxOn]}>{on && <Text style={s.tick}>✓</Text>}</View>
            <Text style={s.chkT}>{c.n} ({rand(c.fee)})</Text>
          </TouchableOpacity>
        );
      })}
    </View>
    <FieldError msg={fieldErr.courses} />

    <H2 style={s.gap}>Multi-course discounts</H2>
    <Table head={['Courses chosen', 'Discount']} rows={TIERS.map(([min, p], k) => [k === TIERS.length - 1 ? `${min} or more` : String(min), p ? `${p}%` : 'None'])} />

    <Btn title="Calculate total" onPress={() => { onCalculate(); showMessage(); }} />

    <View onLayout={(e) => { msgY.current = e.nativeEvent.layout.y; }}>
      {errors.length > 0 && (
        <View style={s.err} accessibilityLiveRegion="assertive">
          <Text style={s.errHead}>Please fix {errors.length === 1 ? 'this problem' : `these ${errors.length} problems`}:</Text>
          {errors.map((e) => <Text key={e} style={s.errT}>{'•  '}{e}</Text>)}
        </View>
      )}
      {done !== '' && <View style={s.ok} accessibilityLiveRegion="polite"><Text style={s.okT}>{done}</Text></View>}
      {quote && (
        <View>
          <H2>Your quote</H2>
          <Text style={s.caption}>Quote for {tidy(form.name)}, {form.intake} intake</Text>
          <Table
            head={['Course', 'Fee']}
            total
            rows={[
              ...selected.map((i) => [courses[i].n, rand(courses[i].fee)]),
              [`Subtotal (${quote.count} course${quote.count > 1 ? 's' : ''})`, R(quote.sub)],
              [`Discount (${quote.pct}%)`, quote.disc ? R(-quote.disc) : 'None'],
              ['Amount after discount', R(quote.after)],
              [`VAT (${VAT_RATE}%)`, R(quote.vat)],
              ['Total (quote only)', R(quote.total)],
            ]}
          />
          <Btn title="Request a consultant to contact me" onPress={() => { onBook(); showMessage(); }} />
        </View>
      )}
    </View>
  </>);
}

// ---------- 4 and 5. App ----------
function Main() {
  const insets = useSafeAreaInsets();
  const scroller = useRef(null);

  const [screen, setScreen] = useState('home');
  const [cur, setCur] = useState(0);
  const [selected, setSelected] = useState([]);      // array of chosen course indexes
  const [enquiries, setEnquiries] = useState([]);    // array of confirmed quote requests
  const [form, setForm] = useState({ name: '', phone: '', email: '', intake: '' });
  const [fieldErr, setFieldErr] = useState({});
  const [menu, setMenu] = useState(false);           // intake drop-down visibility
  const [errors, setErrors] = useState([]);
  const [quote, setQuote] = useState(null);
  const [done, setDone] = useState('');

  const go = (to, i) => {
    if (i !== undefined) setCur(i);
    setScreen(to);
    if (to === 'fees') { setQuote(null); setDone(''); setErrors([]); }
    scroller.current?.scrollTo({ y: 0, animated: false });
  };

  // Android back button: course page -> courses, any other page -> home, home -> leave app.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (menu) { setMenu(false); return true; }
      if (screen === 'detail') { go('courses'); return true; }
      if (screen !== 'home') { go('home'); return true; }
      return false;
    });
    return () => sub.remove();
  });

  const changeSelection = (next) => {
    setSelected([...new Set(next)].sort((a, b) => a - b));
    setQuote(null);                  // never leave an out-of-date quote on screen
    setDone('');
    if (next.length) setFieldErr((f) => ({ ...f, courses: '' }));
  };
  const toggle = (i) => changeSelection(selected.includes(i) ? selected.filter((x) => x !== i) : [...selected, i]);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setQuote(null);
    // Clear a field's error as soon as the user fixes it.
    if (fieldErr[key]) setFieldErr((f) => ({ ...f, [key]: RULES[key](value) }));
  };

  const scrollTo = (y) => scroller.current?.scrollTo({ y: Math.max(y, 0), animated: true });

  const calculate = () => {
    const found = {
      name: RULES.name(form.name), phone: RULES.phone(form.phone), email: RULES.email(form.email),
      intake: RULES.intake(form.intake), courses: RULES.courses(selected),
    };
    const list = Object.keys(found).filter((k) => found[k]).map((k) => `${FIELD_LABEL[k]}: ${found[k]}`);
    setFieldErr(found);
    setErrors(list);
    setDone('');
    setQuote(list.length ? null : buildQuote(selected));
  };

  const book = () => {
    const name = tidy(form.name), phone = cleanPhone(form.phone);
    setEnquiries([...enquiries, {
      name, phone, email: form.email.trim(), intake: form.intake,
      courses: selected.map((i) => courses[i].n), total: quote.total / 100, at: new Date().toISOString(),
    }]);
    setDone(`Thanks ${name}. A consultant will contact you on ${phone} to finalise your booking for the ${form.intake} intake.`);
    // Start fresh so the same request cannot be sent twice by accident.
    setQuote(null);
    setForm({ name: '', phone: '', email: '', intake: '' });
    setFieldErr({});
    setSelected([]);
  };

  // ----- Screens (render functions, so text boxes keep focus while typing) -----
  const home = () => (<>
    <Hero e="🐕🐾" label="Dog and paw prints" />
    <H1>Practical pet care skills, taught with heart</H1>
    <Text style={s.p}>Pawsitive Pet Academy in Durban teaches pet owners, pet sitters, kennel staff and aspiring professionals how to care for, train and work with animals. Choose a six-month programme or a six-week short course.</Text>
    <Btn title="Browse courses" onPress={() => go('courses')} />
    <Btn title="Get a quote" alt onPress={() => go('fees')} />
    <H2 style={s.gap}>Where would you like to start?</H2>
    <TouchableOpacity onPress={() => go('courses')} accessibilityRole="button" activeOpacity={0.8}>
      <Card><Text style={s.cardE}>🎓</Text><Text style={s.h3}>Six-month programmes</Text><Text style={s.p}>Canine Obedience, Pet Grooming, Animal Behaviour and Pet Business Management.</Text><Text style={s.more}>See the programmes ›</Text></Card>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => go('courses')} accessibilityRole="button" activeOpacity={0.8}>
      <Card><Text style={s.cardE}>🩶</Text><Text style={s.h3}>Six-week short courses</Text><Text style={s.p}>Puppy Care, Pet First Aid and Basic Dog Walking.</Text><Text style={s.more}>See the short courses ›</Text></Card>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => go('fees')} accessibilityRole="button" activeOpacity={0.8}>
      <Card><Text style={s.cardE}>💰</Text><Text style={s.h3}>Save when you combine</Text><Text style={s.p}>Two courses save 5%, three save 10%, and more than three save 15%.</Text><Text style={s.more}>Calculate your fees ›</Text></Card>
    </TouchableOpacity>
  </>);

  const about = () => (<>
    <H1>About us</H1>
    <Hero e="🐈🐶" warm label="Cat and dog" />
    <Card>
      <H2 style={s.noTop}>Our history</H2>
      <Text style={s.p}>Pawsitive Pet Academy was established in 2023 by Sarah Smith and offers training courses in Durban. Hundreds of pet owners and aspiring pet care professionals have completed our six-month Professional Development Programmes and six-week Practical Skills Courses.</Text>
      <Text style={s.p}>Sarah noticed that many people own pets without knowing much about proper care, training, nutrition or emergency care. The academy exists to change that, and to create jobs in the pet care industry.</Text>
    </Card>
    <Card><Text style={s.h3}>Vision</Text><Text style={s.p}>A community where every pet is cared for by someone who knows how.</Text></Card>
    <Card><Text style={s.h3}>Mission</Text><Text style={s.p}>To give people practical, professional pet care skills that improve animal wellbeing and open career opportunities.</Text></Card>
    <Card><Text style={s.h3}>Goals</Text><Bullet>Grow graduate numbers every year</Bullet><Bullet>Help graduates start or join pet businesses</Bullet><Bullet>Keep courses practical and affordable</Bullet></Card>
  </>);

  const list = (t) => courses.map((c, i) => (c.t !== t ? null : (
    <TouchableOpacity key={c.n} style={s.row} onPress={() => go('detail', i)} accessibilityRole="button" accessibilityLabel={`${c.n}, ${rand(c.fee)}. View details`} activeOpacity={0.8}>
      <View style={[s.rowPic, t === 'short' && s.picWarm]}><Text style={s.rowE}>{c.e}</Text></View>
      <View style={s.rowBody}>
        <Text style={s.rowT}>{c.n}</Text>
        <Text style={s.fee}>{rand(c.fee)}</Text>
        {selected.includes(i) && <Text style={s.tag}>✓ In your selection</Text>}
      </View>
      <Text style={s.more}>View ›</Text>
    </TouchableOpacity>
  )));

  const coursesScreen = () => (<>
    <H1>Our courses</H1>
    <H2>Six-month programmes</H2>{list('long')}
    <H2 style={s.gap}>Six-week short courses</H2>{list('short')}
    <H2 style={s.gap}>Compare all courses</H2>
    <Table head={['Course', 'Length', 'Fee']} rows={courses.map((c) => [c.n, c.t === 'long' ? '6 months' : '6 weeks', rand(c.fee)])} />
  </>);

  const detail = () => {
    const c = courses[cur]; const on = selected.includes(cur);
    return (<>
      <TouchableOpacity onPress={() => go('courses')} accessibilityRole="link"><Text style={s.backLink}>‹ All courses</Text></TouchableOpacity>
      <Hero e={c.e} warm={c.t === 'short'} label={c.n} />
      <H1>{c.n}</H1>
      <Text style={[s.tag, c.t === 'short' && s.tagWarm]}>{TYPE_LABEL[c.t]}</Text>
      <Text style={[s.fee, s.feeBig]}>Course fee: {rand(c.fee)}</Text>
      <H2>Purpose</H2><Text style={s.p}>{c.p}</Text>
      <H2>Content</H2>{c.c.map((x) => <Bullet key={x}>{x}</Bullet>)}
      <Btn title={on ? 'Remove from my selection' : 'Add to my selection'} onPress={() => toggle(cur)} />
      <Btn title={selected.length ? `Go to fees (${selected.length} selected)` : 'Go to fees'} alt onPress={() => go('fees')} />
    </>);
  };

  const open = (url) => Linking.openURL(url).catch(() => {});
  const contact = () => (<>
    <H1>Contact us</H1>
    <Card>
      <Text style={s.h3}>Get in touch</Text>
      <Text style={s.p}><Text style={s.bold}>Phone: </Text><Text style={s.link} onPress={() => open('tel:+27310000000')} accessibilityRole="link">031 000 0000</Text></Text>
      <Text style={s.p}><Text style={s.bold}>Email: </Text><Text style={s.link} onPress={() => open('mailto:info@pawsitivepet.example')} accessibilityRole="link">info@pawsitivepet.example</Text></Text>
      <Text style={s.p}>
        <Text style={s.bold}>Social: </Text>
        <Text style={s.link} onPress={() => open('https://www.facebook.com/')} accessibilityRole="link">Facebook</Text>{'  ·  '}
        <Text style={s.link} onPress={() => open('https://www.instagram.com/')} accessibilityRole="link">Instagram</Text>{'  ·  '}
        <Text style={s.link} onPress={() => open('https://www.tiktok.com/')} accessibilityRole="link">TikTok</Text>
      </Text>
    </Card>
    <Card>
      <Text style={s.h3}>Venue</Text>
      <Text style={s.p}>Pawsitive Pet Academy{'\n'}[Street address], Durban, KwaZulu-Natal</Text>
    </Card>
    <H2 style={s.gap}>Office hours</H2>
    <Table head={['Day', 'Hours']} rows={[['Monday to Friday', '08:00 to 17:00'], ['Saturday', '08:00 to 12:00'], ['Sunday and public holidays', 'Closed']]} />
    <H2 style={s.gap}>Find us</H2>
    <View style={s.map}>
      <WebView source={{ uri: MAP_URL }} startInLoadingState accessibilityLabel="Map of Durban" />
    </View>
  </>);

  const fees = () => (
    <FeesScreen
      form={form} fieldErr={fieldErr} setField={setField} setFieldErr={setFieldErr}
      selected={selected} toggle={toggle} menuOpen={menu} openMenu={() => setMenu(true)}
      errors={errors} quote={quote} done={done} onCalculate={calculate} onBook={book} scrollTo={scrollTo}
    />
  );

  const screens = { home, about, courses: coursesScreen, detail, fees, contact };
  const render = screens[screen] || home;
  const active = screen === 'detail' ? 'courses' : screen;

  return (
    <View style={s.root}>
      <StatusBar style="light" />
      <View style={[s.top, { paddingTop: insets.top + 10 }]}>
        <Image source={require('./assets/logo.png')} style={s.logo} accessibilityLabel="Pawsitive Pet Academy logo" />
        <Text style={s.topT} accessibilityRole="header">Pawsitive Pet Academy</Text>
      </View>

      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scroller} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          {render()}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[s.tabs, { paddingBottom: Math.max(insets.bottom, 6) }]} accessibilityRole="tablist">
        {tabs.map(([k, l, ic]) => {
          const on = active === k;
          return (
            <TouchableOpacity key={k} style={s.tab} onPress={() => go(k)} accessibilityRole="tab" aria-selected={on}
              accessibilityLabel={k === 'fees' && selected.length ? `${l}, ${selected.length} courses selected` : l}>
              <View>
                <Text style={s.tabI}>{ic}</Text>
                {k === 'fees' && selected.length > 0 && <View style={s.badge}><Text style={s.badgeT}>{selected.length}</Text></View>}
              </View>
              <Text style={[s.tabT, on && s.tabOn]}>{l}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Preferred intake drop-down */}
      <Modal visible={menu} transparent animationType="fade" onRequestClose={() => setMenu(false)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setMenu(false)} accessibilityLabel="Close intake list">
          <View style={s.sheet}>
            <Text style={s.sheetH} accessibilityRole="header">Choose an intake</Text>
            {intakes.map((o) => {
              const on = form.intake === o;
              return (
                <TouchableOpacity key={o} style={[s.opt, on && s.optOn]} onPress={() => { setField('intake', o); setFieldErr((f) => ({ ...f, intake: '' })); setMenu(false); }}
                  accessibilityRole="radio" aria-checked={on}>
                  <Text style={[s.optT, on && s.bold]}>{o}</Text>
                  {on && <Text style={s.optTick}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Main />
    </SafeAreaProvider>
  );
}

// ---------- 6. Styles ----------
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.cream },
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  top: { backgroundColor: C.deep, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  logo: { width: 36, height: 36, marginRight: 10 },
  topT: { color: '#FFFFFF', fontWeight: '700', fontSize: 17 },
  h1: { fontSize: 26, fontWeight: '700', color: C.deep, marginTop: 14, marginBottom: 8, lineHeight: 32 },
  h2: { fontSize: 19, fontWeight: '700', color: C.deep, marginTop: 14, marginBottom: 6 },
  h3: { fontSize: 17, fontWeight: '700', color: C.deep, marginBottom: 4 },
  gap: { marginTop: 24 },
  noTop: { marginTop: 0 },
  p: { fontSize: 15, color: C.ink, lineHeight: 22, marginBottom: 6 },
  bold: { fontWeight: '700' },
  hint: { fontSize: 13, color: C.muted, marginTop: 4 },
  caption: { fontWeight: '700', color: C.deep, marginBottom: 6 },
  fee: { fontWeight: '700', color: C.deep },
  feeBig: { fontSize: 16, marginTop: 8 },
  more: { color: C.teal, fontWeight: '700', marginTop: 2 },
  backLink: { color: C.teal, fontWeight: '700', fontSize: 15, paddingVertical: 6, marginBottom: 6 },
  pic: { backgroundColor: C.teal, borderRadius: 16, height: 150, alignItems: 'center', justifyContent: 'center' },
  picWarm: { backgroundColor: C.coral },
  picE: { fontSize: 48 },
  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 14, marginTop: 12 },
  cardE: { fontSize: 28, marginBottom: 6 },
  tag: { alignSelf: 'flex-start', fontSize: 12, fontWeight: '700', color: C.deep, backgroundColor: C.cream, borderColor: C.line, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2, marginTop: 4, overflow: 'hidden' },
  tagWarm: { backgroundColor: '#FDF0E2', color: '#8A4A12' },
  btn: { backgroundColor: C.coral, borderRadius: 10, paddingVertical: 14, paddingHorizontal: 12, alignItems: 'center', marginTop: 12, minHeight: 48, justifyContent: 'center' },
  btnAlt: { backgroundColor: C.deep },
  btnT: { fontWeight: '700', color: '#1D1D1D', fontSize: 15, textAlign: 'center' },
  btnTAlt: { color: '#FFFFFF' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 12, marginTop: 8 },
  rowPic: { width: 52, height: 52, borderRadius: 10, backgroundColor: C.teal, alignItems: 'center', justifyContent: 'center' },
  rowE: { fontSize: 26 },
  rowBody: { flex: 1, marginLeft: 12 },
  rowT: { fontSize: 16, fontWeight: '700', color: C.ink },
  lbl: { fontWeight: '700', color: C.ink, marginTop: 14, marginBottom: 4, fontSize: 15 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: C.line, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: C.ink, minHeight: 48 },
  inputBad: { borderColor: C.error, backgroundColor: '#FFFAFA' },
  select: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectT: { color: C.ink, fontSize: 15 },
  placeholder: { color: '#8A8A8A', fontSize: 15 },
  caret: { color: C.deep, fontSize: 16 },
  fieldErr: { color: C.error, fontWeight: '700', fontSize: 13, marginTop: 4 },
  chkList: { borderRadius: 8, borderWidth: 2, borderColor: 'transparent', paddingHorizontal: 4 },
  chkBad: { borderColor: C.error },
  chk: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, minHeight: 44 },
  box: { width: 26, height: 26, borderRadius: 6, borderWidth: 2, borderColor: C.teal, alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: '#FFFFFF' },
  boxOn: { backgroundColor: C.teal },
  tick: { color: '#FFFFFF', fontWeight: '700', fontSize: 16, lineHeight: 18 },
  chkT: { flex: 1, color: C.ink, fontSize: 15 },
  err: { backgroundColor: C.errorBg, borderLeftWidth: 5, borderLeftColor: C.error, padding: 12, borderRadius: 6, marginTop: 14 },
  errHead: { fontWeight: '700', color: C.errorInk, marginBottom: 4 },
  errT: { color: C.errorInk, lineHeight: 21 },
  ok: { backgroundColor: C.okBg, borderLeftWidth: 5, borderLeftColor: C.teal, padding: 12, borderRadius: 6, marginTop: 14 },
  okT: { color: C.ink, lineHeight: 21 },
  table: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: C.line, borderRadius: 10, overflow: 'hidden', marginTop: 4 },
  tr: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: C.line },
  th: { backgroundColor: C.deep, borderBottomWidth: 0 },
  thT: { color: '#FFFFFF', fontWeight: '700' },
  trAlt: { backgroundColor: '#FCFAF6' },
  trTotal: { backgroundColor: '#F3ECE0', borderBottomWidth: 0 },
  td: { flex: 1, color: C.ink, paddingRight: 8 },
  tdR: { color: C.ink, textAlign: 'right' },
  link: { color: C.teal, textDecorationLine: 'underline', fontWeight: '700' },
  map: { height: 260, borderRadius: 12, overflow: 'hidden', marginTop: 4, borderWidth: 1, borderColor: C.line },
  tabs: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: C.line, paddingTop: 6 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 4, minHeight: 48 },
  tabI: { fontSize: 20, textAlign: 'center' },
  tabT: { fontSize: 11, color: '#666666', marginTop: 2 },
  tabOn: { color: C.deep, fontWeight: '700' },
  badge: { position: 'absolute', top: -4, right: -12, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: C.coral, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeT: { fontSize: 11, fontWeight: '700', color: '#1D1D1D' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 30 },
  sheet: { backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden' },
  sheetH: { fontWeight: '700', color: C.deep, fontSize: 16, padding: 16, borderBottomWidth: 1, borderBottomColor: C.line },
  opt: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: C.line, minHeight: 52 },
  optOn: { backgroundColor: C.cream },
  optT: { fontSize: 16, color: C.ink },
  optTick: { color: C.teal, fontWeight: '700', fontSize: 16 },
});
