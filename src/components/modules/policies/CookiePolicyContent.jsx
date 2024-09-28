import { List } from '@mantine/core';
import React from 'react';

const CookiePolicyContent = () => (
  <div className="px-5 max-h-[500px] overflow-y-auto">
    <h2 className="text-center font-bold my-3">COOKIE POLICY</h2>

    <section>
      <p>
        This Cookie Policy describes the different types of cookies put by{' '}
        <span className="font-bold">ADARTH PRIVATE LIMITED</span> on its Website and/or Application.
        We may change this Cookie Policy at any time in order to reflect, for example, changes to
        the cookies we use or for other operational, legal or regulatory reasons.
      </p>
      <p>
        If you have questions regarding this Cookie Policy, please contact us at{' '}
        <span className="underline text-blue-600">info@adarth.in</span>
      </p>
    </section>

    <section className="mt-5">
      <h2 className="font-bold mb-5">What is a cookie?</h2>
      <p>
        A cookie is a small file of letters and numbers that we store on your browser or the hard
        drive of your computer if you agree. By continuing to browse the platform, you are agreeing
        to our use of cookies. Cookies contain information that is transferred to your computer’s
        hard drive. You can set your browser to refuse all or some browser cookies, or to alert you
        when a Website and/or Application. sets or access cookies. If you disable or refuse cookies,
        please note some parts of this Website and/or Application. may become inaccessible or not
        function properly.
      </p>
    </section>

    <section className="mt-5">
      <h2 className="font-bold mb-5">What cookies do we use?</h2>
      <List withPadding listStyleType="disc" type="ordered">
        <List.Item>
          <span className="font-bold">Strictly necessary cookies:</span> These are cookies that are
          required for the operation of our Website and/or Application.. They include, for example,
          cookies that enable you to log into secure areas of our Website and/or Application., use a
          shopping cart or make use of e-billing services.
        </List.Item>
        <List.Item>
          <span className="font-bold">Analytical/performance cookies:</span> They allow us to
          recognize and count the number of visitors and to see how visitors move around our Website
          and/or Application. when they are using it. This helps us to improve the way our Website
          and/or Application. works, for example, by ensuring that users are finding what they are
          looking for easily.
        </List.Item>
        <List.Item>
          <span className="font-bold">Functionality cookies:</span> These are used to recognize you
          when you return to our Website and/or Application.. This enables us to personalize our
          content for you, greet you by name and remember your preferences (for example, your choice
          of language or region).
        </List.Item>
        <List.Item>
          <span className="font-bold">Targeting cookies:</span> These cookies record your visit to
          our Website and/or Application., the pages you have visited and the links you have
          followed. We will use this information to make our Website and/or Application. and the
          advertising displayed on it more relevant to your interests. We may also share this
          information with third-parties for this purpose.
          <p className="mt-2">
            Please note that third-parties (including, for example, advertising networks and
            providers of external services like web traffic analysis services) may also use cookies,
            over which we have no control. These cookies are likely to be analytical/performance
            cookies or targeting cookies. You can block cookies by activating the setting on your
            browser that allows you to refuse the setting of all or some cookies. However, if you
            use your browser settings to block all cookies (including essential cookies) you may not
            be able to access all or parts of our Website and/or Application.
          </p>
        </List.Item>
        <List.Item>
          <span className="font-bold">Advertising cookies:</span> Cookies that are used to collect
          information about your visit to our site, including the content you have viewed, the links
          you have followed and information about your browser, device and your IP address
        </List.Item>
      </List>
    </section>

    <section className="my-5">
      <h2 className="text-center font-bold">WEBSITE ANALYTICS</h2>
      <p>
        We use various Analytics platforms to help us to understand how you make use of our content
        and work out how we can make things better. These cookies follow your progress through us,
        collecting anonymous data on where you have come from, which pages you visit, and how long
        you spend on the site. This data is then stored by Google, windows, ios operating system and
        other similar platforms to create reports. These cookies do not store your personal data.
      </p>
      <p>
        The information generated by the cookie about your use of the App, including your IP
        address, may be transmitted to and stored by Google servers, windows, ios operating system
        and other similar platforms on servers in the United States or other domicile country.
        Website analytics platforms may use this information for the purpose of evaluating your use
        of the App, compiling reports on App activity for us and providing other services relating
        to App activity and internet usage. These platforms may also transfer this information to
        third parties where required to do so by law, or where such third parties process the
        information on behalf of these platforms. These platforms will not associate your IP address
        with any other data. By using this App, you consent to the processing of data about you by
        these platforms in the manner and for the purposes set out above.
      </p>
    </section>

    <section className="my-5">
      <h2 className="text-center font-bold">GOOGLE ADSENSE AND SIMILAR ADVERTISEMENT PLATFORM</h2>
      <p>
        Google AdSense and similar advertisement platforms allows Application publishers to deliver
        advertisements to site visitors in exchange for revenue calculated on a per-click or
        per-impression basis. To do this, Google and similar advertisement platforms uses cookies
        and tracking technology to deliver ads personalized to a App user/visitor. In this regard
        the following terms are specified to the Users:
      </p>

      <List withPadding listStyleType="disc" type="ordered">
        <List.Item>
          Third-party vendors, use cookies to serve ads based on your prior visits to our App or
          other Apps.
        </List.Item>
        <List.Item>
          Google&apos;s and similar platform’s use of advertising cookies enables us and our
          partners to serve advertisements to you based on their visit to our Platform and/or other
          Apps on the Internet.
        </List.Item>
        <List.Item>You may opt-out of personalized advertising by visiting Ads Settings.</List.Item>
        <List.Item>
          All advertisements of third parties on our App are for informative purposes only and
          neither the App nor the Firm guarantees or bears liability for the authenticity of the
          advertisements.
        </List.Item>
        <List.Item>
          At no point will the Firm permit its competitors to advertise on the App.
        </List.Item>
        <List.Item>
          You may visit the links in the advertisements at your own risk or choose to not accept the
          cookies permitting third parties to display their advertisements.
        </List.Item>
      </List>
    </section>

    <section>
      <h2 className="font-bold mb-5">How do I manage cookies?</h2>
      <p>
        You can choose whether to accept our cookies (except Strictly Necessary Cookies) by clicking
        on the Website and/or Appropriate opt-out links in our Cookie Preference Center, which can
        be found in our Site’s footer and cookie banner. You also have the right to refuse or accept
        cookies at any time by activating settings on your browser.
      </p>
      <p>
        Note that blocking some types of cookies may impact your experience on our Site and the
        services we are able to offer you.
      </p>
    </section>
  </div>
);

export default CookiePolicyContent;
