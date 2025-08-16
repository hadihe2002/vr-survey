const surveyJSON = {
  locale: "fa",
  title: {
    default: "بررسی تاثیر واقعیت مجازی بر تصمیم مشتری در پیش خرید املاک",
    fa: "بررسی تاثیر واقعیت مجازی بر تصمیم مشتری در پیش فروش املاک",
  },
  description: {
    default:
      "تصور کنید که به دنبال خرید یک ملک نوساز هستید. اطلاعات مربوط به یک پروژه مسکونی جدید به شما ارائه شده است.\nاین اطلاعات ممکن است از طریق تجربه واقعیت مجازی (VR) (با هدست یا روی صفحه نمایش) یا از طریق روش‌های سنتی مانند عکس، ویدیو و بروشور ارائه شده باشد.\nلطفاً به سؤالات زیر بر اساس تجربه خود پاسخ دهید. پاسخ‌های شما به ما کمک می‌کند تا تأثیر این روش‌ها را در تصمیم‌گیری مشتریان بهتر درک کنیم.\nلطفاً میزان موافقت خود را با هر عبارت مشخص کنید. اطلاعات و پاسخ‌های شما کاملا محرمانه است.",
    fa: " ",
  },
  logo: {
    fa: "https://www.sharif.ir/documents/20124/0/logo-fa-IR.png/4d9b72bc-494b-ed5a-d3bb-e7dfd319aec8?t=1609608338755",
  },
  logoHeight: "80px",
  pages: [
    {
      name: "Page 1 - Intro",
      title: {
        fa: "توضیحات اولیه",
      },
      elements: [
        {
          type: "expression",
          name: "Intro",
          title: {
            fa: "تصور کنید که به دنبال خرید یک ملک نوساز هستید. اطلاعات مربوط به یک پروژه مسکونی جدید به شما ارائه شده است.\nاین اطلاعات ممکن است از طریق تجربه واقعیت مجازی (VR) (با هدست یا روی صفحه نمایش) یا از طریق روش‌های سنتی مانند عکس، ویدیو و بروشور ارائه شده باشد\nاین پروژه هنوز در حال ساخت است و امکان مراجعه‌ی حضوری و ارائه ی عکس کامل از واحد مربوطه وجود ندارد.\nاین پروژه و ملک واقع در شهر لندن انگلیس توسط Berkeley Group در حال ساخت می‌باشد.\n",
          },
        },
      ],
    },
    {
      name: "Page 2 - Demographic",
      title: "سوالات جمعیت شناختی",
      elements: [
        {
          type: "radiogroup",
          name: "Gender",
          title: "جنسیت",
          isRequired: true,
          choices: [
            {
              value: "Man",
              text: "مرد",
            },
            {
              value: "Female",
              text: "زن",
            },
          ],
        },
        {
          type: "radiogroup",
          name: "Age",
          title: "سن",
          isRequired: true,
          choices: [
            {
              value: "zero-to-twenty",
              text: "0-20",
            },
            {
              value: "twenty-to-forty",
              text: "20-40",
            },
            {
              value: "forty-to-sixty",
              text: "40-60",
            },
            {
              value: "sixty-or-more",
              text: {
                default: "60 - 100+",
                fa: "60+",
              },
            },
          ],
        },
        {
          type: "radiogroup",
          name: "College Degree",
          title: "سطح تحصیلات",
          isRequired: true,
          choices: [
            {
              value: "Below Diploma",
              text: "زیر دیپلم",
            },
            {
              value: "Diploma",
              text: "دیپلم",
            },
            {
              value: "Bachelor",
              text: "کارشناسی",
            },
            {
              value: "Master",
              text: "کارشناسی ارشد",
            },
            {
              value: "Doctorate",
              text: "دکتری",
            },
          ],
        },
        {
          type: "radiogroup",
          name: "Occupation",
          title: "وضعیت شغلی",
          isRequired: true,
          choices: [
            {
              value: "Student",
              text: "دانشجو",
            },
            {
              value: "Employee",
              text: "کارمند",
            },
            {
              value: "Manager",
              text: "مدیر",
            },
            {
              value: "Retired",
              text: "بازنشسته",
            },
            {
              value: "Other",
              text: "سایر",
            },
          ],
        },
      ],
    },
    {
      name: "Page 3 - Trust 2D",
      title: {
        fa: "ارزیابی تاثیر تصاویر دو بعدی بر اعتماد مشتری",
      },
      elements: [
        {
          type: "expression",
          name: "Explanation 1",
          title: {
            fa: "در این بخش تصویری از نقشه‌ی دو بعدی ملک در حال ساخت نشان داده می‌شود.",
          },
        },
        {
          type: "image",
          name: "2D Site Plan",
          maxWidth: "65%",
          imageLink: {
            fa: "https://api.surveyjs.io/private/Surveys/files?name=c2fc96bb-9b00-4d98-ac9a-9ec14550f30d",
          },
          imageFit: "cover",
          imageHeight: "auto",
          imageWidth: "100%",
        },
        {
          type: "expression",
          name: "Explanation 2",
          title: {
            fa: "در اینجا هم دو عکس از واحد‌های دیگر ساخته شده توسط این سازنده نمایش داده می‌شود.",
          },
        },
        {
          type: "image",
          name: "2D Similar Build 1",
          maxWidth: "65%",
          imageLink: {
            fa: "https://api.surveyjs.io/private/Surveys/files?name=172ab56b-bab2-4efe-a551-357943863258",
          },
          contentMode: "image",
          imageFit: "cover",
          imageHeight: "auto",
          imageWidth: "100%",
        },
        {
          type: "image",
          name: "2D Similar Build 2",
          maxWidth: "65%",
          imageLink: {
            fa: "https://api.surveyjs.io/private/Surveys/files?name=5ceb57da-1061-484e-881a-6f3f3782b0e8",
          },
          imageFit: "cover",
          imageHeight: "auto",
          imageWidth: "100%",
        },
        {
          type: "rating",
          name: "Trust Analyze 2D",
          title: {
            fa: "تا چه میزان توانایی تحلیل نقشه‌ی ارائه شده را دارا هستید؟",
          },
          isRequired: true,
          autoGenerate: false,
          rateValues: [1, 2, 3, 4, 5],
          minRateDescription: "خیلی کم",
          maxRateDescription: "خیلی زیاد",
        },
        {
          type: "rating",
          name: "Trust Imagination 2D",
          title: {
            fa: "این تصاویر تا چه میزان می‌تواند تصویر ملک نهایی را در ذهن شما ایجاد نماید؟",
          },
          isRequired: true,
          autoGenerate: false,
          rateValues: [1, 2, 3, 4, 5],
          minRateDescription: "خیلی کم",
          maxRateDescription: "خیلی زیاد",
        },
        {
          type: "rating",
          name: "Trust View 2D",
          title: {
            fa: "میزان اطمینان شما بابت به سازنده بابت محوطه سازی و نمای ملک چه قدر است؟",
          },
          isRequired: true,
          autoGenerate: false,
          rateValues: [1, 2, 3, 4, 5],
          minRateDescription: "خیلی کم",
          maxRateDescription: "خیلی زیاد",
        },
        {
          type: "rating",
          name: "Trust Materials 2D",
          title: {
            fa: "میزان اطمینان شما بابت مصالح و مواد مورد استفاده چه قدر است؟",
          },
          isRequired: true,
          autoGenerate: false,
          rateValues: [1, 2, 3, 4, 5],
          minRateDescription: "خیلی کم",
          maxRateDescription: "خیلی زیاد",
        },
        {
          type: "rating",
          name: "Trust Details 2D",
          title: {
            fa: " عکس‌های ارائه شده، چه میزان جزییات مورد نیاز برای خرید یک ملک را نمایش می‌دهد؟ ",
          },
          isRequired: true,
          autoGenerate: false,
          rateValues: [1, 2, 3, 4, 5],
          minRateDescription: "خیلی کم",
          maxRateDescription: "خیلی زیاد",
        },
        {
          type: "rating",
          name: "Trust Developer 2D",
          title: {
            fa: "چقدر این تجربه باعث شد فکر کنید سازنده این ملک حرفه‌ای است؟",
          },
          isRequired: true,
          autoGenerate: false,
          rateValues: [1, 2, 3, 4, 5],
          minRateDescription: "خیلی کم",
          maxRateDescription: "خیلی زیاد",
        },
      ],
    },
    {
      name: "Page 4 - Conversation Rate 2D",
      title: {
        fa: "ارزیابی تاثیر تصاویر دوبعدی بر افزایش نرخ فروش",
      },
      elements: [
        {
          type: "rating",
          name: "Conversation Presence 2D",
          title: {
            fa: "چقدر احساس کردید این تجربه جایگزین خوبی برای بازدید اولیه حضوری است؟",
          },
          isRequired: true,
          autoGenerate: false,
          rateValues: [1, 2, 3, 4, 5],
          minRateDescription: "خیلی کم",
          maxRateDescription: "خیلی زیاد",
        },
        {
          type: "rating",
          name: "Conversation Buy Decision 2D",
          title: {
            fa: " فرض کنید سرمایه در دست شما برای پیش خرید خانه 500 هزار دلار باشد.\n قیمت این واحد 388هزار دلار است. چه میزان تمایل دارید روی این ملک سرمایه گذاری کنید؟ ",
          },
          isRequired: true,
          autoGenerate: false,
          rateValues: [1, 2, 3, 4, 5],
          minRateDescription: "خیلی کم",
          maxRateDescription: "خیلی زیاد",
        },
        {
          type: "rating",
          name: "Conversation Action 2D",
          title: {
            fa: "چقدر احتمال دارد با مشاور فروش یا سازنده تماس بگیرید؟",
          },
          isRequired: true,
          autoGenerate: false,
          rateValues: [1, 2, 3, 4, 5],
          minRateDescription: "خیلی کم",
          maxRateDescription: "خیلی زیاد",
        },
      ],
    },
    {
      name: "Page 5 - Uncertainty 2D",
      title: {
        fa: "ارزیابی تاثیر تصاویر دوبعدی بر کاهش عدم قطعیت",
      },
      elements: [
        {
          type: "rating",
          name: "Uncertainty Real Presence 2D",
          title: {
            fa: "تا چه حد احساس کردید واقعاً در فضای این ملک حضور دارید؟",
          },
          isRequired: true,
          autoGenerate: false,
          rateValues: [1, 2, 3, 4, 5],
          minRateDescription: "خیلی کم",
          maxRateDescription: "خیلی زیاد",
        },
        {
          type: "rating",
          name: "Uncertainty Clarity 2D",
          title: {
            fa: "چقدر این تجربه باعث شد دید واضح‌تری نسبت به ملک داشته باشید؟",
          },
          isRequired: true,
          autoGenerate: false,
          rateValues: [1, 2, 3, 4, 5],
          minRateDescription: "خیلی کم",
          maxRateDescription: "خیلی زیاد",
        },
        {
          type: "rating",
          name: "Uncertainty Details Decision 2D",
          title: {
            fa: "چقدر احساس کردید جزییات ارائه شده در این تجربه برای تصمیم‌گیری در مورد خرید کافی بود؟",
          },
          isRequired: true,
          autoGenerate: false,
          rateValues: [1, 2, 3, 4, 5],
          minRateDescription: "خیلی کم",
          maxRateDescription: "خیلی زیاد",
        },
        {
          type: "rating",
          name: "Uncertainty Enough Details 2D",
          title: {
            fa: "چه میزان نسبت به جنبه‌های مختلف ملک مثل فضا، طراحی، نور مطمئن شدید؟",
          },
          isRequired: true,
          autoGenerate: false,
          rateValues: [1, 2, 3, 4, 5],
          minRateDescription: "خیلی کم",
          maxRateDescription: "خیلی زیاد",
        },
      ],
    },
    {
      name: "Acces",
      title: {
        fa: "آیا به عینک واقعیت مجازی دسترسی دارید؟",
      },
      elements: [
        {
          type: "radiogroup",
          name: "VR Access",
          title: {
            fa: "آیا به عینک های واقعیت مجازی دسترسی دارید؟",
          },
          isRequired: true,
          choices: [
            {
              value: "Yes",
              text: {
                fa: "بله",
              },
            },
            {
              value: "No",
              text: {
                fa: "خیر",
              },
            },
          ],
        },
      ],
    },
    {
      name: "Headset",
      title: {
        fa: "تجربه با هدست",
      },
      elements: [
        {
          type: "html",
          name: "WebXR",
          html: {
            fa: '<iframe allow="xr-spatial-tracking; gamepad; microphone; camera; vr; ar" allowfullscreen width="960" height="641.5" src=\'https://vr-webgl.darkube.app/webxr\'></iframe>',
          },
        },
      ],
    },
    {
      name: "Computer",
      title: {
        fa: "تجربه با کامپیوتر",
      },
      elements: [
        {
          type: "expression",
          name: "question1",
          title: {
            fa: "با کمک کیبورد و موس می‌توانید در صحنه حرکت کنید. \nلطفا کمی منتظر بمانید تا مدل لود شود.\nاز آخرین نسخه‌ی بروزر استفاده کنید.",
          },
        },
        {
          type: "html",
          name: "WebGL",
          html: {
            fa: '<iframe allow="xr-spatial-tracking; gamepad; microphone; camera; vr; ar" allowfullscreen width="960" height="641.5" src=\'https://vr-webgl.darkube.app/webgl\'></iframe>',
          },
        },
      ],
    },
    {
      name: "Page 6 - Trust VR",
      title: {
        fa: "ارزیابی تاثیر واقعیت مجازی بر اعتماد مشتری",
      },
      elements: [
        {
          type: "rating",
          name: "Trust Analyze VR",
          title: {
            fa: "تا چه میزان توانایی تحلیل فضای ارائه شده را دارا هستید؟",
          },
          isRequired: true,
          autoGenerate: false,
          rateValues: [1, 2, 3, 4, 5],
          minRateDescription: "خیلی کم",
          maxRateDescription: "خیلی زیاد",
        },
        {
          type: "rating",
          name: "Trust Imagination VR",
          title: {
            fa: "محیط سه بعدی تا چه میزان می‌تواند تصویر ملک نهایی را در ذهن شما ایجاد نماید؟",
          },
          isRequired: true,
          autoGenerate: false,
          rateValues: [1, 2, 3, 4, 5],
          minRateDescription: "خیلی کم",
          maxRateDescription: "خیلی زیاد",
        },
        {
          type: "rating",
          name: "Trust Materials VR",
          title: {
            fa: "میزان اطمینان شما بابت مصالح و مواد مورد استفاده چه قدر است؟",
          },
          isRequired: true,
          autoGenerate: false,
          rateValues: [1, 2, 3, 4, 5],
          minRateDescription: "خیلی کم",
          maxRateDescription: "خیلی زیاد",
        },
        {
          type: "rating",
          name: "Trust Details VR",
          title: {
            fa: " فضای ارائه شده، چه میزان جزییات مورد نیاز برای خرید یک ملک را نمایش می‌دهد؟ ",
          },
          isRequired: true,
          autoGenerate: false,
          rateValues: [1, 2, 3, 4, 5],
          minRateDescription: "خیلی کم",
          maxRateDescription: "خیلی زیاد",
        },
        {
          type: "rating",
          name: "Trust Developer VR",
          title: {
            fa: "چقدر این تجربه باعث شد فکر کنید سازنده این ملک حرفه‌ای است؟",
          },
          isRequired: true,
          autoGenerate: false,
          rateValues: [1, 2, 3, 4, 5],
          minRateDescription: "خیلی کم",
          maxRateDescription: "خیلی زیاد",
        },
      ],
    },
    {
      name: "Page 7 - Conversation Rate VR",
      title: {
        fa: "ارزیابی تاثیر واقعیت مجازی بر افزایش نرخ فروش",
      },
      elements: [
        {
          type: "rating",
          name: "Conversation Presence VR",
          title: {
            fa: "چقدر احساس کردید این تجربه جایگزین خوبی برای بازدید اولیه حضوری است؟",
          },
          isRequired: true,
          autoGenerate: false,
          rateValues: [1, 2, 3, 4, 5],
          minRateDescription: "خیلی کم",
          maxRateDescription: "خیلی زیاد",
        },
        {
          type: "rating",
          name: "Conversation Buy Decision VR",
          title: {
            fa: " فرض کنید سرمایه در دست شما برای پیش خرید خانه 500 هزار دلار باشد.\r\n قیمت این واحد 388هزار دلار است. چه میزان تمایل دارید روی این ملک سرمایه گذاری کنید؟ ",
          },
          isRequired: true,
          autoGenerate: false,
          rateValues: [1, 2, 3, 4, 5],
          minRateDescription: "خیلی کم",
          maxRateDescription: "خیلی زیاد",
        },
        {
          type: "rating",
          name: "Conversation Action VR",
          title: {
            fa: "چقدر احتمال دارد با مشاور فروش یا سازنده تماس بگیرید؟",
          },
          isRequired: true,
          autoGenerate: false,
          rateValues: [1, 2, 3, 4, 5],
          minRateDescription: "خیلی کم",
          maxRateDescription: "خیلی زیاد",
        },
      ],
    },
    {
      name: "Page 8 - Uncertainty VR",
      title: {
        fa: "ارزیابی تاثیر واقعیت مجازی بر کاهش عدم قطعیت",
      },
      elements: [
        {
          type: "rating",
          name: "Uncertainty Real Presence VR",
          title: {
            fa: "تا چه حد احساس کردید واقعاً در فضای این ملک حضور دارید؟",
          },
          isRequired: true,
          autoGenerate: false,
          rateValues: [1, 2, 3, 4, 5],
          minRateDescription: "خیلی کم",
          maxRateDescription: "خیلی زیاد",
        },
        {
          type: "rating",
          name: "Uncertainty Clarity VR",
          title: {
            fa: "چقدر این تجربه باعث شد دید واضح‌تری نسبت به ملک داشته باشید؟",
          },
          isRequired: true,
          autoGenerate: false,
          rateValues: [1, 2, 3, 4, 5],
          minRateDescription: "خیلی کم",
          maxRateDescription: "خیلی زیاد",
        },
        {
          type: "rating",
          name: "Uncertainty Details Decision VR",
          title: {
            fa: "چقدر احساس کردید جزییات ارائه شده در این تجربه برای تصمیم‌گیری در مورد خرید کافی بود؟",
          },
          isRequired: true,
          autoGenerate: false,
          rateValues: [1, 2, 3, 4, 5],
          minRateDescription: "خیلی کم",
          maxRateDescription: "خیلی زیاد",
        },
        {
          type: "rating",
          name: "Uncertainty Enough Details VR",
          title: {
            fa: "چه میزان نسبت به جنبه‌های مختلف ملک مثل فضا، طراحی، نور مطمئن شدید؟",
          },
          isRequired: true,
          autoGenerate: false,
          rateValues: [1, 2, 3, 4, 5],
          minRateDescription: "خیلی کم",
          maxRateDescription: "خیلی زیاد",
        },
      ],
    },
  ],
  triggers: [
    {
      type: "skip",
      expression: "{VR Access} = 'No'",
      gotoName: "WebGL",
    },
  ],
  showProgressBar: true,
  progressBarType: "questions",
  firstPageIsStartPage: true,
  headerView: "advanced",
};

export default surveyJSON;
