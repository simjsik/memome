import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, type JWTPayload } from 'jose';

function generateNonce(): string {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

async function sha256Hex(input: string): Promise<string> {
    const data = new TextEncoder().encode(input);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

const ACCESS_SECRET = process.env.JWT_SECRET || '';
const CSRF_SECRET = process.env.CSRF_SECRET || '';
const PASS_PATH = [
    "/login",
    "/_next",
    "/static",
    "/favicon.ico",
    '/.well-known',
]

const AUTH_PUBLIC = [
    "/api/login",
    "/api/logout",
    "/api/customToken",
];

const nonce = generateNonce();

const styleHashes = [
    "sha256-zftXtTiozi4NqMeYxJ/wAFRaIWOAejKFqNh1+Wk12Vk=",
    "sha256-qvMP7yOij/NZIxJAiADWYVZbdIihexbXVxKbFj6T2MI=",
    "sha256-otva1f6wkDzV9WurEmTw97pTGspFB6xN+csaPY1e4zI=",
    "sha256-57GCXobV9ZrfnnzAWcz//WfzeGNfevTKdsoxtI25AZQ=",
    "sha256-eXQbyB8YxZkWD5epgriI5Aoh333fjv618WjVSFU6Fbg=",
    "sha256-/njX6B78PGTBraXQ6mH1bYCXVi3WJKlCGN17JPEK4Q8=",
    "sha256-eNIPPaOamV/ib5wgfSPY7JyaVMnJjKTIIGo9yu04dns=",
    "sha256-uynp81lkWe3ENuo5JQDvzP2HBVZtV7rDFse1S5KMKYU=",
    "sha256-Z48SLN7BDrnlrkV3Ayto4e9RdtFuhJriqid0a0SU1gQ=",
    "sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=",
    "sha256-N6tSydZ64AHCaOWfwKbUhxXx2fRFDxHOaL3e3CO7GPI=",
    "sha256-fq7Md9B0amksVBTk/2TaltdrTVq2JN7fvIk0tt80qzU=",
    "sha256-xYFSKvPMCj0Vk3NmF1uDgVUQmi3L4JsVHJrhB8S4tbw=",
    "sha256-Ttt/bmFw+dmA+g2PkUEuxsBL6M02Q+HF61TAeiNsjro=",
    "sha256-MizmzrYbxcCxJr0W1K/Z14Iec3la7xLE9Fb2lkR0KQA=",
    "sha256-LnYONn2bqVTW1q+4xTrr6sjwVsmtd1c/XXHj4aRH75g=",
    "sha256-WUi579HKIKWgE3g04VCrUrRDOP/5kufIDR1BOzX+QXI=",
    "sha256-ImRE02ZFFz/0nRW8Gh9wk8S1OfP1/3yM9f7tWf49uYQ=",
    "sha256-SV0+KQmEG9z2c5j3KKzXQC79TiPEwbHoVgiEFzg4TC0=",
    "sha256-GwHZT535b07mYnmBNai2AVuOqmgTTF1A4EqzeDlIyl0=",
    "sha256-hviaKDxYhtiZD+bQBHVEytAzlGZ4afiWmKzkG+0beN8=",
    "sha256-n8J8gRN8i9TcT9YXl0FTO+YR7t53ht5jak0CbXJTtOY=",
    "sha256-uLchvEWMsEECU4bwHeXW2/TBPhNjz/BqwQXBXLLyJgw=",
    "sha256-r1CdFo7qy8R40kOUsNAhoIyEbU5gIdZbw5B60zgKiak=",
    "sha256-DyVZHcot51Ajnsrfgau05r7xTa5GaCieNj194kF3/PE=",
    "sha256-bp8SOW+F6MqzXwRg+CjGqYSgZKePbEeXR9mWihyB9N0=",
    "sha256-SNRa2TqSDe3fmC1ildCQj1WZ4x8adCorrsUJ1dwrGPI=",
    "sha256-UTLKZ4iRwN16EQocQADl6Ws/1PxhdgCCEil0vLljYmU=",
    "sha256-593I+EI41jKSKxw/7hnykemymPxZ5go3kfDHBjfFn8A=",
    "sha256-1Ihl8eQwu8XzAXfzImS/6qLbkYfTFXXE62HiL1jpLyM=",
    "sha256-WTT7K4PAjxDm98edS4Mtb0pwRUiXI8//npjqrEBMvtE=",
    "sha256-eJEj6aOYfYL+t1D1ThpAfot5SzgDetcJcWiyhk9Ikmo=",
    "sha256-bmVaDd4fC79JlyB48k8g4JDXTD8t/4cohFuwyLLEF+0=",
    "sha256-xKYz+/bLakVJNJ1alE+0WIjRVW0EJ6L4eAtcY43c1Y0=",
    "sha256-wNF1V44AqF1k3WMNIaWkov8OMn20BTp+HXnXR3Ua6EA=",
    "sha256-Uty3T4c4/BqEceaLZ3jPjnMWOYL77fC7uoxcozHcHwc=",
    "sha256-3+dWT0sIYL87Y5I3BGGc4jqkPMgKwr5ugWuRR6DmsRw=",
    "sha256-CTBEltPiu0jfHQmYu//c4+DSVrYgNkp5GmP3aOZ6Pao=",
    "sha256-YwFUevXIaGs9EjWoyvACGeg4PKKkwEaHsBJjuScOmoA=",
    "sha256-gvm8L69KfKy5TvWFQ7qsrP2Ln6400aZsYRQr9+Uay70=",
    "sha256-P6ZQ62WiSvM/QUJETej2hqmhb/SpjIZXIrS9Hc4KZfY=",
    "sha256-gad3ObyaTNqvkOCH40a3soMCCSjsH1gKTCm1mlb/rIU=",
    "sha256-/qQ9+ZeZnK7lEVLaN6aA0lUH5kHcLmBo4CRY1uEiYJk=",
    "sha256-Haw3D/j2PnXYWMjW/tZyf79V4YKmUkjDyfO8HRirfF8=",
    "sha256-2lEyL4Fi4Tf0yiBdFPGdbGnrD4EHTSWbODUqsnLt1rw=",
    "sha256-mlvKTh4cY0NtScXMXssQZx1uhMGsU+Njhc6T2pydrsc=",
    "sha256-sx4JfhEoQ5Fo7gxkE1gOYSq2CyhlSc08QUReDJODysI=",
    "sha256-vq8yuYEzk/UEKx9ljiX6S26DsM13TOltuT5XHKUx13E=",
    "sha256-iCAiL17AJ2UHMXEKFfT4Zpt26VlTU0/uorVMjLn/890=",
    "sha256-jwWvjTqUcwRivhPpzxSmQviBbVVAcxiqDybwA1DeLwg=",
    "sha256-EZPzprA/HrmKtEbD+m6ZBGfpZbBDUwGAJh40N1DipZQ=",
    "sha256-zBbmyZbc/pcETv15w4K5wdeKFoPmeL5InSPiW2gBkpg=",
    "sha256-RdqrNHJ3uaiBgj3+SjpgYxDbM9LFhbGqsqVzq/Q4YNk=",
    "sha256-Hc7Ttvc5W+kkM5cbk2UD0X8Dmcr2d58Lt8kvodMF+FM=",
    "sha256-J+jUkfHNIX8UJL6WN7levMV/71YVOFI8M4fd8verXaA=",
    "sha256-NM1NLf1ygWBaA07i3BTNxvZ888oTNxKi/OUUatvAan8=",
    "sha256-fpijDju8HYQBrdWC7Pu6S/zpaV7YAr3rMVkTslL3/sQ=",
    "sha256-1N91OtSg1n8z1mMgXyvIqcrRtbWQuAbepsUMOflw8a4=",
    "sha256-zPMiGFtI85WZqiJuWwviL/MK3eVTN23acRBpnMvwzss=",
    "sha256-GyCrQBo6s1GN3c57RCo+3zNw4SN/Ah5Jdci3DmrDHAc=",
    "sha256-VzArkaHqscWn+i33QxTwWaZNiN8BOFalaWZ/WO0k8cY=",
    "sha256-36Oj1w9Bg4evALbyxa+4DpFUoEMqMSL7a2IQyWJniLI=",
    "sha256-quX/9Fvq1GtrUByr7RTGLtSkN745gS6pw8V+td6GmaQ=",
    "sha256-fuvOyr+5ReVROhbwl5YKEu8cykKFkYzBApSneJD9es4=",
    "sha256-UeUI9OOPflq8RGmnhZE+L7IYhw5hK6XRMWFItQzpxNA=",
    "sha256-ZKFgAuqnJZHkR3z/VuyVaLcwjjuw5InUxuRG+Jt3Fnk=",
    "sha256-m3XdyqnoOtq/Ab2hIL87dbkkh+QxN4c6JSvMUYznIy0=",
    "sha256-Wfz0thE/IrR3/Jygu9VXO1dcAt8HLdVFtF5alYM4wQE=",
    "sha256-MCdQMVP3PRWuR0RP0SE7f2sPNHoHrTHaqRoCnWEULjU=",
    "sha256-gYIFq4BNIhJgWvJZopH/IEqmdHrmAFDiyeoI07ClSRg=",
    "sha256-i85DZxxh5WXQV7zXDze16A4nwsvgshEVEGK71ytGLLg=",
    "sha256-qJtchQe6jYOmp61rywmuNiP04OLXhvqo5txpPVW4Y3o=",
    "sha256-6m2/18O8XSI0OLaj54U5axZU5zScBicUK6wA9X9p//I=",
    "sha256-Rd7FIUlQzi/avT19VP1pnhjSiNP4ns9+ltRqELyzTWw=",
    "sha256-ncQuBgTBbCJe5SI1KtOv1JRZnwn867RDs8GD1tKyVHI=",
    "sha256-HxMJT8X4mciyeE2oDvO08C4Uaz0W6txUAoMRae6cQfU=",
    "sha256-SPo+sbojE11tTqLtg0KTGKDcEGa6j4AjUTA316gnSmA=",
    "sha256-8FwacSQUj/uGBplEs3IY0gsYauL21hsiHMzIvS0FXDE=",
    "sha256-i1EfB2+xYUUG32uDRMNI/DN/F9YIrGWOYdHENz9GKME=",
    "sha256-pxBXuHetGtR+LLcZp/WQn/VdlMPd5J3wt/GK/QIMeTQ=",
    "sha256-LnKs1keCqxctv78a9FO7W61BCqpiiqpg2vyBGsOCMcI=",
    "sha256-yZHoMYHCTL4UbTCYI1O6T5p9JLgVM1ZYBzlEpDYz0DM=",
    "sha256-hOQB/e46rQrzOBUmbkGMmhD0a7rTBGj1X2u27jQinH0=",
    "sha256-e7YnJwrL1cpI24wdVh8t6pHB5n6+zTZEZy016S8qMcs=",
    "sha256-zbWT5Ti6KmrDrsuC2uZI8cQQaAwi+ft6IfHdHRM3ct4=",
    "sha256-dBndQXmPnCdKx11cnNRBl8TQVFrfHKcwXH0TNmGyXr0=",
    "sha256-PSy4sdvgl4ni5ELDkuByujQTM1Uscg3SBtvGZ/fXshc=",
    "sha256-hfq2YCnR9qDq3yu4+D7yfJjl6VFOl3zLX5EQsUtkBOc=",
    "sha256-HMeZxAfWUYo8HpmhfRTNAwBB7DISvVSY6eGcFuUrYLA=",
    "sha256-MA4XmUqpIZBdBtmRxpG/DPzD2Y7KSkFm4KCy8DanQY0=",
    "sha256-3WI6J9/kWYy8duDOXDlQpLwGlkNKYK/cJRDSe0d82ck=",
    "sha256-H9AAjQVClXIDZbvVgOM5k5tRdxLonOa1d8r4EkW7y84=",
    "sha256-P0Iqj29Kn+GzlaMqhequjIyliwrEeWeTAuCstk1caYs=",
    "sha256-2hKlu+5c/qmjc5UnuHp6xae5HqOz0Jsrup1QYNi+Hww=",
    "sha256-itkdAQwpInPkp+mEM4xZLSVYiczyLrO2hd5OmwEd1Uo=",
    "sha256-RWIWCWk1myKAiKepZbJnnqdbzY8sqDxZ5YLFynVTvmQ=",
    "sha256-BRwi+PKRRQH7d2UWCVDJcN99BA3/xOdl7wLYTHOV8P4=",
    "sha256-OzZbiDQs/vwi9040wg9U+cGsMVN6ZZi7CciFmzvdIsg=",
    "sha256-mRuEsCFgag3V317r9iq6v9sMSnPb5bz6zO7xD1eKZJM=",
    "sha256-yqOByi6XVUbZo6bHf5+A2WjDgX6hGFrub1QvDCr+yJY=",
    "sha256-nJCV+azQQG4Ihxb0XKH00kbAgwbwbY9rJ0XNpHdR3Hs=",
    "sha256-Q4hlN5Q504XzJyGC778/zpkXTq6+wN6bcLZ5Xzy00Hw=",
    "sha256-rRRpw+YaBdc5g222V4KIDh1BSZ9mz1JmhgybJ4AvLg0=",
    "sha256-G73DJpGS8SPAQyBx8fvf3/L43Hrj0zNwpN1HbI72ros=",
    "sha256-SEvhtxDKGB4alZ6mhpwiHKylHIvd+NQgDhMKjQEcwh4=",
    "sha256-gKXOnUIvwsAntLPyJw6DdP140pODG2QQ/B7xsJa5kGY=",
    "sha256-sWPUZMzZmWOS0AbBPmMTLx04IzzSkSrqMT0L9Ak0qIw=",
    "sha256-Dbnh5yKmItE0waodnbZfwNsrRdPhSKdiLcbtGSX+lTE=",
    "sha256-L2U2fblbLvm35PA3aJXUKaPZ1b3/7z6dPyV0D2DY8j4=",
    "sha256-nrQ4iicUdFxdNC43+Uh+6714TT/NU3mGxCP4B6alh/s=",
    "sha256-Bt2vcSQSOUj3GvPYiwRBPFd1EOnCPyZ5FNV8kyoKwTA=",
    "sha256-H1dtI07CTx9LAopLGax/t1PlAelwE+cp4mMp+jr3Y6w=",
    "sha256-prM9VYIvOMf1xT0SrPM/yU7eOQoI4TXPbRBmg5hC0tE=",
    "sha256-9RqaAsTH9Lsv+ZgjOJvF8AyygDVz6I/xKYEjaU6IM2k=",
    "sha256-og4+izcOUJxsx1mWk+RETmcOwW9eCSFGUjIEaegzEJk=",
    "sha256-u4gziZBMCTW8/Jt/w/uOgCf6zbe7FOh+Y9fujEX1mF0=",
    "sha256-sTjaAyhn9vQLKeCzHqTLp0Uu8aiWJnT6EFFEOfK8Mhc=",
    "sha256-pNk13d7HChBJoQJMrSCKNx05fyLNV/jvVfdwLG9N/MA=",
    "sha256-lcx1PO0bT8xt6etQXne8n90u6B/Ivy6hbG9hBgFYjmM=",
    "sha256-5j04aXMZyYNrXflDA/IK0Ir6nG0hqZZ27coto8vCuqo=",
    "sha256-7oSkQrcrcZaV8uNePCAZQh0yX7tid8+DZ5zGcEnEIf8=",
    "sha256-SnBMZkSjpcmmBNotP9shf9Dt9+YDQRKLDu3D/tHgyyM=",
    "sha256-R+9EoGZsMbkewNxW5akHUb32M2lwS+5KTkfMd8rFgg0=",
    "sha256-FokN/+kIUZhhERTI1yr+omBqxTEfNGw8QX77h7jo7z4=",
    "sha256-XpnvRgS7DPb8tqAPrm9L7QfoSeIkbv/yEBZEJsOKGHg=",
    "sha256-OuyuF+41lNyl2EXFradZ770ynqBjFdDXpRVqRwFoqr4=",
    "sha256-grAaEf6bBoEASLWbUGWTOI+vHXo8rjATNbNxQjzI7uY=",
    "sha256-9VxHelcDdMJ2qD1ZVYjX1vrcXDQ7225nhJofQgZYIqs=",
    "sha256-PCodMGEpRNyuG6KKOCxA8EEjW+7FCRipZ7X1isgITzA=",
    "sha256-T9oAxr25HzMQKx3nzxKvflNNKvrj7V1DUwmoEWYVAgc=",
    "sha256-aKDR3RslfQO8fTA/YwMmv19iv0owbkZO60XZswQMZlI=",
    "sha256-pWr0GU7FzLRKbGjGNnqIV6OZTKjQsYSzWxxC2Yabczo=",
    "sha256-ic5MrBA8sLPmqYo4T7jX1zlS2cyxSuDoYaDleA29UTs=",
    "sha256-NmQhBDtkC8TEirM6dd9gkgyA/GwOMks6jPJh8YnC8NE=",
    "sha256-q2C3QsGw6Tnf9uxvr1H40FkFM+wUinePKvn/T3qe51o=",
    "sha256-+bQB9n6SPXsKx98yF5dJLFtcX1ZXn59oSjYLI7McdW8=",
    "sha256-ANczGZP7Bqw8XXrQt77H0xOmJrlcx+NV0D0i3ZyNDZg=",
    "sha256-j/MqzzABi6ZBY+i9ZZWNMlPFnFOXlYbp/5jd1JjyZUM=",
    "sha256-nBgpdJfhZsB5rCYosAJKDwQFyulyhiqxa1QXzFTOH3E=",
    "sha256-QZSarLcNwDjkvjN+HI8qegi45QnosbCox9v/E8chWas=",
    "sha256-q7Ox+gTWs4Bo+BsGLsvlMkZRGYLYlnLrj11Pf2n6r/M=",
    "sha256-e/boJM2aKl0k2XYD4VI332/nIHrKpyn0ueD7Ff773qM=",
    "sha256-1xFdEmZ9A0O54YGDKn2MxxE2v5UrfiyeC4pNu70BXts=",
    "sha256-SWshrBBVETYfgYFILl9DyQ1NTXZYHcwrp9QV60ljuNo=",
    "sha256-DHfu59Cevw+rOOHwgM5ork2V2hrCwya2tZdi1FP0I1Y=",
    "sha256-+47wjvGKBhpBNnKPuBDx1Kzyq/iuRNfZLoaW7knN4EI=",
    "sha256-yKACQI2y1JSIoCWrvvsg7fL1CfK87o84Tvtm+eyA6UY=",
    "sha256-RTsWDI/Q84YzZFdEmQFtMGHqMMrXyBXefV1A/0B4SUs=",
    "sha256-UaLECGTLFT/j+Ik1kUV9J/hXUj2H1eY8QPpiAF51Mi8=",
    "sha256-4boTJCMw6coW1+pIKjvqfkj60ebHojbGlSR+xh8RODI=",
    "sha256-u9zOh5CpYSOcvOsuVQABpaRqzagDYxMQABUcrUwsW+8=",
    "sha256-HgSyEHGIarOgYip6d6wok6W3EogXqA6kTsJAOa8D2J8=",
    "sha256-A23GjeMhKbTvQuVA1mx84z0G469ezFfCwSupItXsX1M=",
    "sha256-loua8WESShvNzEr3fIq/z3o9PPsDmBaKz+q4Jvo9M9M=",
    "sha256-fgMv+Ta42MHJ0xVc+she7Xf0/B2IS72kfjSqLiRPJKk=",
    "sha256-JIrv39xgTnPWw/wV+Oejsx1QCeV2rqhAXp/f33Z6ONI=",
    "sha256-SA3bLwDqLt9UaqrxihK27pWV5p6d19KKcCReRJnsOX0=",
    "sha256-Mp4q6Q4I+7GvbNZdN9Z8zWxI5SRd35ASFe04ebgYc5k=",
    "sha256-2hbjI5NeWguqQZqPg/VaUnjRy+mkhaUFAw3SPkRFrtQ=",
    "sha256-NRF9u9VqnzcMgRYWyR5XANkbGX7ctJyyl6yHPiw3Zag=",
    "sha256-K/HfRfglhqq3vGr96YaJfMkAAmQ5/SobvesWytGS2po=",
    "sha256-W+O9jmcEFvXZiUPcwYMmVxH0VZ4Kbsma0lBS0otdbSU=",
    "sha256-5iQhYJetz5pTq2yt+bHRyxYPdznjflSH1qJ2N7iGW7g=",
    "sha256-zP3GyL83rTnRgL8kGWjAptekxQlsuxUrx76xU7L+kQk=",
    "sha256-z7gCHD0QEXPaiDv7eDRzgo26xGcQtYlgZuW10QG2sOk=",
    "sha256-MpP4CDTJLlJOeXTJa1uPhne05EwoXHT2TZAjJQrwq9o=",
    "sha256-eHg2zJ4J21StOV6uCh0nQZUBYYkGJXaG1s2lTJZg68U=",
    "sha256-7XGJhUxr1vqT/Rio8z83l3cBcervEhZC8idbfSgYhyQ=",
    "sha256-hs2yPMDmZqO58WUsDMY1WQlS9wbhqkjhYT0d/RTS49Y=",
    "sha256-oqnV97edZCXXe+HVUovxXhRwDy7rti3lPCP6V2zRF/M=",
    "sha256-SnGQ5QJYZCN0jQAIGDrgd+Tx6aQnT55Lk58nghDaDfw=",
    "sha256-aKcJit3F8P8zc4tV+Jjs3Ysauo92Q9iLrPzrIhijLcs=",
    "sha256-P9ogvVVplDGAV03RoSxzaibdeEAYgHxpPag30Ipz9qo=",
    "sha256-5N6Na+xznwzf3kJKlnsW2dbDWdx3/rySTf0O+SrMVHA=",
    "sha256-JNHZIASGXOxGItQErt9rDjZIO97/yKInBGHAyEXT++c=",
    "sha256-f44Cv8vAN8bFjHuFUsRmVqaCPx+Z3KB9vciZFaIC0r8=",
    "sha256-tVlCu5WmZUuoPmHgd7M1eRaeJO1MezXKO3oOlVM23qA=",
    "sha256-C1+8eCHGJroiV3PRAYrmiioZZ98XpNDn/VJtj5DKUqs=",
    "sha256-YKNPY80J/DM7D1DsnNFShWHeUXv4KsWgtAA8KL+cJOk=",
    "sha256-ZXwrx+dy8rIWKYasqbGuJ1XGEUt9rajg8aID28qAsGY=",
    "sha256-NcHmxLPEKfWJTMqJixtRWKqMYFCYyEfy1X3fE3WXoBI=",
    "sha256-0S5Y/rv/078kJschKGcB7kzEH28DzgDm6Mda/k7Q4QU=",
    "sha256-7QlltfyW4uWB2GL4ojWJ0nQ9b+FVEiwhaYzXuOvuWAk=",
    "sha256-aKOrEndNAkbZLWQwXuOdouODgmzKFolS/nSZblBj+uA=",
    "sha256-uMDKqHX5r43MreOnC4PGRb0EL3XpDWzzrOAG77TNf88=",
    "sha256-WnBPKOFanrxhJ8VKEyObZl0FMgrs8zU/gS/0escC7H0=",
    "sha256-pBNoS/Dw2SBKDzUfJdIJzVVWn9J2Qq4AnBKsu2jYKQg=",
    "sha256-181oE+v13en5m1SVaqSDIytwEayc9PNq9twwxL+w3yM=",
    "sha256-8LZEFGQFNeHdSe2rKZqSBwG/6Ug0K3FUnIJFlCWdaSw="
];

const scriptSrc = [`'self'`, `'nonce-${nonce}'`, "https://apis.google.com"];

const imgSrc = [`'self'`, "data:", "https://res.cloudinary.com", "https://lh3.googleusercontent.com"];

const connectSrc = [
    "'self'",
    "https://identitytoolkit.googleapis.com",
    "https://firestore.googleapis.com",
    "http://localhost:3000",
    "https://6bvm9p8u9w-dsn.algolia.net",
    "wss://relieved-florence-meloudy-61e63699.koyeb.app",
    "https://securetoken.googleapis.com"
];

async function verifyJwt(token: string, secret: string): Promise<JWTPayload> {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload as JWTPayload;
}

// 1) 인증·리다이렉트 로직 (기존 코드)
export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const method = (req.method || "GET").toUpperCase();
    const isRefresh = pathname === '/api/refresh' && method === 'POST';

    if (PASS_PATH.some(prefix => pathname.startsWith(prefix))) {
        return NextResponse.next();
    }

    if (AUTH_PUBLIC.some(p => pathname.startsWith(p))) {
        console.log('로그인 API 패스')
        return NextResponse.next();
    }

    let refreshPayload: JWTPayload | null = null;

    if (isRefresh) {
        const headerRefreshCsrf = req.headers.get('x-refresh-csrf') ?? undefined;
        if (!headerRefreshCsrf) {
            return new NextResponse(JSON.stringify({ message: "갱신 토큰 확인 불가" }), { status: 403, headers: { "content-type": "application/json" } });
        }

        try {
            refreshPayload = await verifyJwt(headerRefreshCsrf, CSRF_SECRET);
            if (!refreshPayload?.uid || !refreshPayload?.jti) {
                return new NextResponse(JSON.stringify({ message: "유효하지 않은 토큰 : Refresh 1" }), { status: 403, headers: { "content-type": "application/json" } });
            }

            const session = req.cookies.get('session')?.value;
            if (!session) {
                return new NextResponse(JSON.stringify({ message: "세션 확인 불가 : Refresh" }), { status: 403 });
            }

            const sessionHash = (await sha256Hex(session)).toLowerCase();
            const sidFromToken = String(refreshPayload.sid ?? "").toLowerCase();

            if (!sidFromToken) {
                return new NextResponse(JSON.stringify({ message: "토큰 시드 누락 : Refresh" }), { status: 403, headers: { "content-type": "application/json" } });
            }

            if (sessionHash !== sidFromToken) {
                return new NextResponse(JSON.stringify({ message: "세션 불일치(Refresh CSRF)" }), { status: 403, headers: { "content-type": "application/json" } });
            }

            if (refreshPayload.type !== 'refresh') {
                console.error(refreshPayload.type)
                return new NextResponse(JSON.stringify({ message: "유효하지 않은 토큰 타입 : Refresh" }), { status: 403 });
            }

            const cookieRefreshCsrf = req.cookies.get('refreshCsrfToken')?.value;

            if (!cookieRefreshCsrf || headerRefreshCsrf !== cookieRefreshCsrf) {
                return new NextResponse(JSON.stringify({ message: "유효하지 않은 토큰 : Refresh 2" }), { status: 403, headers: { "content-type": "application/json" } });
            }
        } catch (error) {
            console.error('CSRF 검증 실패 : ' + error);
            return new NextResponse(JSON.stringify({ message: "CSRF 검증 실패" }), {
                status: 403,
                headers: { "content-type": "application/json" },
            });
        }
    }

    let userPayload: JWTPayload | null = null;

    if (!isRefresh) {
        const userToken = req.cookies.get('userToken')?.value;
        const csrfCookie = req.cookies.get('csrfToken')?.value;

        if (!userToken || !csrfCookie) {
            if (pathname.startsWith('/api/')) {
                return new NextResponse(JSON.stringify({ message: "토큰 확인 불가" }), {
                    status: 401,
                    headers: { "content-type": "application/json" }
                });
            } else {
                const url = req.nextUrl.clone(); url.pathname = '/login';
                console.log('토큰 검증 실패' + pathname);
                return NextResponse.redirect(url);
            }
        }

        try {
            userPayload = await verifyJwt(userToken, ACCESS_SECRET);

            if (!userPayload) {
                // 예외 처리: 이 지점에 도달하면 원래 의도와 다름
                return new NextResponse(JSON.stringify({ message: '유효하지 않은 토큰' }), {
                    status: 401,
                    headers: { 'content-type': 'application/json' }
                });
            }

            if (!userPayload?.uid || !userPayload?.jti) {
                const clearCookies: string[] = [
                    'userToken=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax',
                    'csrfToken=; Path=/; Max-Age=0; SameSite=Lax'
                ];

                const headers = new Headers();
                headers.set("content-type", "application/json");
                headers.append("set-cookie", clearCookies[0]);
                headers.append("set-cookie", clearCookies[1]);

                if (pathname.startsWith("/api/")) {
                    return new NextResponse(JSON.stringify({ message: "유효하지 않은 토큰 : User" }), {
                        status: 401,
                        headers
                    });
                } else {
                    const url = req.nextUrl.clone(); url.pathname = "/login";
                    return NextResponse.redirect(url, { headers });
                }
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                const errName = error?.name ?? error?.message ?? '';
                const isExpired = /expire/i.test(String(errName)) || /expired/i.test(String(errName));

                if (isExpired) {
                    // 페이지 거부
                    if (!pathname.startsWith('/api/')) {
                        const url = req.nextUrl.clone(); url.pathname = '/login';
                        console.log('토큰 검증 실패' + pathname);
                        return NextResponse.redirect(url);
                    }

                    // api 거부
                    return new NextResponse(JSON.stringify({ message: '토큰 만료됨.', needRefresh: true }), {
                        status: 401,
                        headers: { 'content-type': 'application/json' },
                    });
                }
            }

            // 외 인증 불가
            if (pathname.startsWith('/api/')) {
                return new NextResponse(JSON.stringify({ message: '유효하지 않은 토큰 : User' }), {
                    status: 401,
                    headers: { 'content-type': 'application/json' },
                });
            } else {
                const url = req.nextUrl.clone();
                url.pathname = '/login';
                return NextResponse.redirect(url);
            }
        }

        const csrfValidate = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

        if (csrfValidate) {
            const headerCsrf = req.headers.get("x-csrf-token") ?? undefined;

            if (!headerCsrf) {
                return new NextResponse(JSON.stringify({ message: "CSRF 토큰 확인 불가" }), { status: 403, headers: { "content-type": "application/json" } });
            }

            try {
                const csrfPayload = await verifyJwt(headerCsrf, CSRF_SECRET);

                if (!csrfPayload?.uid || !csrfPayload?.jti) {
                    return new NextResponse(JSON.stringify({ message: "유효하지 않은 토큰 : CSRF 1" }), { status: 403, headers: { "content-type": "application/json" } });
                }

                if (csrfPayload.type !== 'csrf') {
                    return new NextResponse(JSON.stringify({ message: "유효하지 않은 토큰 타입 : CSRF" }), { status: 403 });
                }

                if (headerCsrf !== csrfCookie) {
                    return new NextResponse(JSON.stringify({ message: "유효하지 않은 토큰 : CSRF 2" }), { status: 403, headers: { "content-type": "application/json" } });
                }

                if (String(csrfPayload.uid) !== String(userPayload.uid) || String(csrfPayload.jti) !== String(userPayload.jti)) {
                    return new NextResponse(JSON.stringify({ message: "토큰 키 불일치 : CSRF" }), { status: 403, headers: { "content-type": "application/json" } });
                }
            } catch (error) {
                console.error('CSRF 검증 실패 : ' + error);
                return new NextResponse(JSON.stringify({ message: "CSRF 검증 실패", }), {
                    status: 403,
                    headers: { "content-type": "application/json" },
                });
            }
        }
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-uid", String(userPayload!.uid));
    if (userPayload!.admin === true) requestHeaders.set("x-user-admin", String(userPayload!.admin));
    if (userPayload!.hasGuest === true) requestHeaders.set('x-user-guest', String(userPayload!.hasGuest));

    const res = NextResponse.next({
        request: { headers: requestHeaders },       // 수정된 요청 헤더 사용
    });

    const styleHashTokens = styleHashes.map(h => `'${h}'`).join(' ');

    if (process.env.NODE_ENV !== "production") {
        // 개발에서만 임시 허용
        scriptSrc.push(`'unsafe-eval'`);
    }

    const directives = [
        `default-src 'none'`,
        `script-src 'self' ${scriptSrc.join(" ")}`,
        `style-src 'self' 'nonce-${nonce}' 'unsafe-hashes' ${styleHashTokens}`,
        `img-src ${imgSrc.join(" ")}`,
        `font-src 'self'`,
        `connect-src ${connectSrc.join(" ")}`,
        `frame-src 'self' https://meloudy-96af8.firebaseapp.com`,
    ];

    const csp = directives.join('; ');

    // 추가 보안 헤더도 응답에 설정
    res.headers.set('x-csp-nonce', nonce);
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.headers.set('Content-Security-Policy', csp);

    return res;
}

export const config = {
    matcher: ['/:path*']
};