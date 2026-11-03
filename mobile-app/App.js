import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet, Image,
  Linking, BackHandler, KeyboardAvoidingView, Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

/* =========================================================
   Pawsitive Pet Academy: mobile app
   1. Data and helpers      4. Screens
   2. Validation            5. App shell (header, tabs, drop-down)
   3. Small components      6. Styles
   ========================================================= */

// ---------- 1. Data and helpers ----------
const C = {
  deep: '#0B5E5E', teal: '#0F7C7C', coral: '#F4A259', coralDark: '#E58A3A', cream: '#FAF6F0', ink: '#2F2F2F',
  line: '#E4DCCF', muted: '#555555', error: '#C0392B', errorBg: '#FDE8E4', errorInk: '#7A1F14', okBg: '#E3F4EE',
};

// Array of course objects (same data as the website)
const courses = [
  { n: 'Canine Obedience Training', fee: 1500, t: 'long', img: 'obedience', alt: 'An alert brown Australian Shepherd', p: 'To teach effective dog obedience and behavioural training techniques.', c: ['Basic commands', 'Leash training', 'Behaviour correction', 'Positive reinforcement', 'Socialisation techniques'] },
  { n: 'Pet Grooming', fee: 1500, t: 'long', img: 'grooming', alt: 'A fluffy cream-coloured dog', p: 'To provide professional grooming skills for domestic pets.', c: ['Coat care', 'Bathing techniques', 'Nail trimming', 'Ear and eye cleaning', 'Grooming equipment'] },
  { n: 'Animal Behaviour', fee: 1500, t: 'long', img: 'behaviour', alt: 'A black and white cat resting on a rock', p: 'To understand common pet behaviours and improve communication with animals.', c: ['Animal psychology', 'Reading body language', 'Stress management', 'Behaviour modification', 'Enrichment activities'] },
  { n: 'Pet Business Management', fee: 1500, t: 'long', img: 'business', alt: 'A brown Vizsla portrait', p: 'To prepare learners to operate a successful pet-related business.', c: ['Customer service', 'Marketing', 'Business planning', 'Financial management', 'Legal requirements'] },
  { n: 'Puppy Care', fee: 750, t: 'short', img: 'puppy', alt: 'An Australian Shepherd puppy in purple flowers', p: 'To provide new puppy owners with essential care knowledge.', c: ['Feeding', 'Vaccinations', 'Toilet training', 'Exercise', 'Socialisation'] },
  { n: 'Pet First Aid', fee: 750, t: 'short', img: 'first-aid', alt: 'A calico cat on fresh snow', p: 'To provide emergency first aid knowledge for pets.', c: ['Minor injuries', 'CPR basics', 'Poison awareness', 'Heatstroke', 'Emergency transport'] },
  { n: 'Basic Dog Walking', fee: 750, t: 'short', img: 'walking', alt: 'A red setter on a forest path', p: 'To teach safe and professional dog walking practices.', c: ['Walking equipment', 'Handling multiple dogs', 'Safety procedures', 'Exercise routines'] },
];
const TYPE_LABEL = { long: 'Six-month programme', short: 'Six-week short course' };
const intakes = ['January', 'April', 'July', 'October'];
const TIERS = [[1, 0], [2, 5], [3, 10], [4, 15]];   // [minimum courses, % discount]
const VAT_RATE = 15;
const tabs = [['home', 'Home', 'home'], ['about', 'About', 'information-circle'], ['courses', 'Courses', 'school'], ['fees', 'Fees', 'calculator'], ['contact', 'Contact', 'call']];

// Real photos (Pixabay licence), bundled with the app so they work offline
const PHOTOS = {
  hero: require('./assets/photos/hero.jpg'),
  about: require('./assets/photos/about.jpg'),
  obedience: require('./assets/photos/obedience.jpg'),
  grooming: require('./assets/photos/grooming.jpg'),
  behaviour: require('./assets/photos/behaviour.jpg'),
  business: require('./assets/photos/business.jpg'),
  puppy: require('./assets/photos/puppy.jpg'),
  'first-aid': require('./assets/photos/first-aid.jpg'),
  walking: require('./assets/photos/walking.jpg'),
};
const MAP_URL = 'https://www.openstreetmap.org/export/embed.html?bbox=30.990%2C-29.848%2C31.036%2C-29.816&layer=mapnik&marker=-29.8320%2C31.0130';
const DIRECTIONS_URL = 'https://www.google.com/maps/dir/?api=1&destination=-29.8320%2C31.0130';

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
const Photo = ({ src, label, style }) => (
  <View style={[s.photo, style]} accessible accessibilityRole="image" accessibilityLabel={label}>
    <Image source={PHOTOS[src]} style={s.photoImg} resizeMode="cover" />
  </View>
);

// Course drop-down button (opens the course list)
const CourseFinder = ({ onOpen }) => (
  <View style={s.finder}>
    <Text style={s.finderL}>Find a course</Text>
    <TouchableOpacity style={[s.input, s.select]} onPress={onOpen} accessibilityRole="combobox" accessibilityLabel="Find a course" accessibilityHint="Opens a list of all seven courses">
      <Text style={s.placeholder}>Choose a course</Text>
      <Ionicons name="chevron-down" size={18} color={C.deep} />
    </TouchableOpacity>
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
  const [courseMenu, setCourseMenu] = useState(false); // course drop-down visibility
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
      if (courseMenu) { setCourseMenu(false); return true; }
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
    {/* Photo with a soft coral shape behind it and two floating labels */}
    <View style={s.art}>
      <View style={s.blob} />
      <Ionicons name="paw" size={30} color={C.coral} style={s.pawDeco} importantForAccessibility="no" />
      <View style={s.heroPhoto} accessible accessibilityRole="image" accessibilityLabel="A chocolate Labrador sitting outdoors in autumn">
        <Image source={PHOTOS.hero} style={s.photoImg} resizeMode="cover" />
      </View>
      <View style={s.chip}>
        <View style={s.chipDot}><Ionicons name="paw" size={14} color={C.deep} /></View>
        <Text style={s.chipT}>Short courses from <Text style={s.chipStrong}>R750</Text></Text>
      </View>
      <View style={s.saveCard}>
        <Text style={s.saveT}>Save up to 15%</Text>
        <Text style={s.saveS}>when you combine courses</Text>
      </View>
    </View>

    <View style={s.eyebrow}><View style={s.eyebrowDot} /><Text style={s.eyebrowT}>Pet care academy · Durban</Text></View>
    <Text style={s.homeH1} accessibilityRole="header">
      Practical pet care skills,{'\n'}<Text style={s.homeEm}>taught with heart</Text>
    </Text>
    <Text style={s.lead}>Six-month programmes and six-week short courses for pet owners, walkers and future pet professionals.</Text>
    <CourseFinder onOpen={() => setCourseMenu(true)} />

    <View style={s.homeLinks}>
      <TouchableOpacity onPress={() => go('courses')} accessibilityRole="link" style={s.pill} activeOpacity={0.7}>
        <Text style={s.pillT}>Browse all courses</Text>
        <Ionicons name="arrow-forward" size={16} color={C.deep} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => go('fees')} accessibilityRole="link" style={s.textLink}>
        <Text style={s.textLinkT}>Get a quote</Text>
      </TouchableOpacity>
    </View>

    <View style={s.facts}>
      {[['list', '7', 'courses to choose from'], ['time-outline', '6 mo · 6 wk', 'programme or short course'], ['pricetag-outline', '15%', 'VAT included in every quote']].map(([ic, n, l]) => (
        <View key={n} style={s.fact} accessible accessibilityLabel={`${n}, ${l}`}>
          <View style={s.factIc}><Ionicons name={ic} size={18} color={C.coralDark} /></View>
          <Text style={s.factN}>{n}</Text>
          <Text style={s.factL}>{l}</Text>
        </View>
      ))}
    </View>
  </>);

  const about = () => (<>
    <H1>About us</H1>
    <Photo src="about" label="A red setter sitting in a meadow of flowers" />
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
      <Image source={PHOTOS[c.img]} style={s.rowPic} accessibilityLabel={c.alt} />
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
    <CourseFinder onOpen={() => setCourseMenu(true)} />
    <H2>Six-month programmes</H2>{list('long')}
    <H2 style={s.gap}>Six-week short courses</H2>{list('short')}
    <H2 style={s.gap}>Compare all courses</H2>
    <Table head={['Course', 'Length', 'Fee']} rows={courses.map((c) => [c.n, c.t === 'long' ? '6 months' : '6 weeks', rand(c.fee)])} />
  </>);

  const detail = () => {
    const c = courses[cur]; const on = selected.includes(cur);
    return (<>
      <TouchableOpacity onPress={() => go('courses')} accessibilityRole="link"><Text style={s.backLink}>‹ All courses</Text></TouchableOpacity>
      <Photo src={c.img} label={c.alt} />
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
      <Text style={s.p}>Pawsitive Pet Academy{'\n'}24 Paw Lane, Morningside{'\n'}Durban, KwaZulu-Natal, 4001</Text>
      <Btn title="Get directions" alt onPress={() => open(DIRECTIONS_URL)} label="Get directions to our venue" />
    </Card>
    <H2 style={s.gap}>Office hours</H2>
    <Table head={['Day', 'Hours']} rows={[['Monday to Friday', '08:00 to 17:00'], ['Saturday', '08:00 to 12:00'], ['Sunday and public holidays', 'Closed']]} />
    <H2 style={s.gap}>Find us</H2>
    <View style={s.map}>
      <WebView source={{ uri: MAP_URL }} startInLoadingState accessibilityLabel="Map showing our venue in Morningside, Durban" />
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
                <Ionicons name={on ? ic : `${ic}-outline`} size={22} color={on ? C.deep : '#777777'} style={s.tabI} />
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

      {/* Course drop-down: every course, grouped by type */}
      <Modal visible={courseMenu} transparent animationType="fade" onRequestClose={() => setCourseMenu(false)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setCourseMenu(false)} accessibilityLabel="Close course list">
          <View style={s.sheet}>
            <Text style={s.sheetH} accessibilityRole="header">Choose a course</Text>
            {[['long', 'Six-month programmes'], ['short', 'Six-week short courses']].map(([t, label]) => (
              <View key={t}>
                <Text style={s.sheetGroup}>{label}</Text>
                {courses.map((c, i) => (c.t !== t ? null : (
                  <TouchableOpacity key={c.n} style={s.optCourse} onPress={() => { setCourseMenu(false); go('detail', i); }} accessibilityRole="button" accessibilityLabel={`${c.n}, ${rand(c.fee)}`}>
                    <Image source={PHOTOS[c.img]} style={s.optThumb} />
                    <Text style={s.optCourseT}>{c.n}</Text>
                    <Text style={s.optFee}>{rand(c.fee)}</Text>
                  </TouchableOpacity>
                )))}
              </View>
            ))}
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
  photo: { width: '100%', aspectRatio: 3 / 2, borderRadius: 16, overflow: 'hidden', backgroundColor: C.line },
  photoImg: { width: '100%', height: '100%' },
  lead: { fontSize: 16, color: C.muted, lineHeight: 24, marginBottom: 18 },
  finder: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, marginBottom: 2, shadowColor: C.deep, shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  finderL: { fontWeight: '700', color: C.muted, marginBottom: 8, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },
  // Home: photo area
  art: { marginTop: 8, paddingTop: 14, paddingLeft: 14, paddingBottom: 18 },
  blob: { position: 'absolute', top: 4, left: 0, right: '12%', bottom: 0, backgroundColor: C.coral, opacity: 0.4, borderTopLeftRadius: 140, borderTopRightRadius: 110, borderBottomLeftRadius: 120, borderBottomRightRadius: 150 },
  pawDeco: { position: 'absolute', top: -6, right: 4, opacity: 0.35, transform: [{ rotate: '25deg' }] },
  heroPhoto: { width: '100%', aspectRatio: 4 / 3, overflow: 'hidden', backgroundColor: C.line, borderTopLeftRadius: 130, borderTopRightRadius: 130, borderBottomLeftRadius: 22, borderBottomRightRadius: 22 },
  chip: { position: 'absolute', top: 28, right: 2, flexDirection: 'row', alignItems: 'center', backgroundColor: C.deep, borderRadius: 999, paddingVertical: 6, paddingLeft: 6, paddingRight: 12, shadowColor: C.deep, shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  chipDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: C.coral, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  chipT: { color: '#FFFFFF', fontSize: 12.5 },
  chipStrong: { color: C.coral, fontWeight: '700' },
  saveCard: { position: 'absolute', left: 0, bottom: 28, backgroundColor: '#FFFFFF', borderLeftWidth: 4, borderLeftColor: C.coral, borderRadius: 14, paddingVertical: 8, paddingHorizontal: 12, shadowColor: '#000000', shadowOpacity: 0.14, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  saveT: { color: C.deep, fontWeight: '700', fontSize: 15 },
  saveS: { color: C.muted, fontSize: 12 },
  // Home: text
  eyebrow: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: C.line, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12, marginTop: 8 },
  eyebrowDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.coral, marginRight: 7 },
  eyebrowT: { color: C.teal, fontWeight: '700', fontSize: 12.5 },
  homeH1: { fontSize: 28, fontWeight: '700', color: C.deep, lineHeight: 34, marginTop: 14, marginBottom: 12 },
  homeEm: { fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }), fontStyle: 'italic', fontWeight: '400', color: C.coralDark, fontSize: 30 },
  homeLinks: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 16 },
  pill: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: C.deep, borderRadius: 999, paddingHorizontal: 16, minHeight: 46, marginRight: 18 },
  pillT: { color: C.deep, fontWeight: '700', fontSize: 15, marginRight: 6 },
  textLink: { minHeight: 46, justifyContent: 'center' },
  textLinkT: { color: C.teal, fontWeight: '700', fontSize: 15, textDecorationLine: 'underline' },
  // Home: key facts
  facts: { flexDirection: 'row', marginTop: 22, marginHorizontal: -4 },
  fact: { flex: 1, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 4, marginHorizontal: 4, shadowColor: C.deep, shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  factIc: { width: 32, height: 32, borderRadius: 10, backgroundColor: C.cream, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  factN: { fontSize: 17, fontWeight: '700', color: C.deep },
  factL: { fontSize: 11.5, color: C.muted, marginTop: 2, textAlign: 'center', lineHeight: 15 },
  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 14, marginTop: 12 },
  tag: { alignSelf: 'flex-start', fontSize: 12, fontWeight: '700', color: C.deep, backgroundColor: C.cream, borderColor: C.line, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2, marginTop: 4, overflow: 'hidden' },
  tagWarm: { backgroundColor: '#FDF0E2', color: '#8A4A12' },
  btn: { backgroundColor: C.coral, borderRadius: 10, paddingVertical: 14, paddingHorizontal: 12, alignItems: 'center', marginTop: 12, minHeight: 48, justifyContent: 'center' },
  btnAlt: { backgroundColor: C.deep },
  btnT: { fontWeight: '700', color: '#1D1D1D', fontSize: 15, textAlign: 'center' },
  btnTAlt: { color: '#FFFFFF' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 12, marginTop: 8 },
  rowPic: { width: 64, height: 64, borderRadius: 10, backgroundColor: C.line },
  rowBody: { flex: 1, marginLeft: 12, marginRight: 8 },
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
  tabI: { textAlign: 'center' },
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
  sheetGroup: { fontSize: 12, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  optCourse: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, minHeight: 52 },
  optThumb: { width: 40, height: 40, borderRadius: 8, marginRight: 12, backgroundColor: C.line },
  optCourseT: { flex: 1, fontSize: 15, color: C.ink },
  optFee: { fontSize: 13, color: C.deep, fontWeight: '700' },
});
