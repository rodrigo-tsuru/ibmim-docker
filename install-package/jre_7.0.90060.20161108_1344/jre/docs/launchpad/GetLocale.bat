@echo off
REM Licensed Materials - Property of IBM
REM 5648-F10 (C) Copyright International Business Machines Corp. 2005, 2007 
REM All Rights Reserved
REM US Government Users Restricted Rights- Use, duplication or disclosure
REM restricted by GSA ADP Schedule Contract with IBM Corp.


CALL "%~dp0%readRegistry.bat" "HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\Nls\Language" Default lang LaunchPadLocaleID > nul

REM We need to normalize that value by removing quotes and spaces.  This is only needed on vista
SET LaunchPadLocaleID=%LaunchPadLocaleID: =%
SET LaunchPadLocaleID=%LaunchPadLocaleID:"=%

IF {%LaunchPadLocale%} == {} GOTO :SKIP_NO_BROWSER

REM If NoBrowserLang is not set, then LaunchPadLocale was set externally to 
REM override the locale.  Need to set a default for NoBrowserLang too.
IF {%NoBrowserLang%} == {} SET NoBrowserLang=%LaunchPadLocale%
GOTO :DONE

:SKIP_NO_BROWSER

SET LaunchPadLocale=en
SET NoBrowserLang=en

REM Albanian
IF {%LaunchPadLocaleID%} == {041C} ( SET LaunchPadLocale=sq
                                     SET NoBrowserLang=sq)
IF {%LaunchPadLocaleID%} == {041c} ( SET LaunchPadLocale=sq
                                     SET NoBrowserLang=sq)

REM Arabic
IF {%LaunchPadLocaleID%} == {3801} ( SET LaunchPadLocale=ar_ae
                                     SET NoBrowserLang=ar)
IF {%LaunchPadLocaleID%} == {3C01} ( SET LaunchPadLocale=ar_bh
                                     SET NoBrowserLang=ar)
IF {%LaunchPadLocaleID%} == {3c01} ( SET LaunchPadLocale=ar_bh
                                     SET NoBrowserLang=ar)
IF {%LaunchPadLocaleID%} == {1401} ( SET LaunchPadLocale=ar_dz
                                     SET NoBrowserLang=ar)
IF {%LaunchPadLocaleID%} == {0C01} ( SET LaunchPadLocale=ar_eg
                                     SET NoBrowserLang=ar)                                     
IF {%LaunchPadLocaleID%} == {0c01} ( SET LaunchPadLocale=ar_eg
                                     SET NoBrowserLang=ar)
IF {%LaunchPadLocaleID%} == {0801} ( SET LaunchPadLocale=ar_iq
                                     SET NoBrowserLang=ar)
IF {%LaunchPadLocaleID%} == {2C01} ( SET LaunchPadLocale=ar_jo
                                     SET NoBrowserLang=ar)
IF {%LaunchPadLocaleID%} == {2c01} ( SET LaunchPadLocale=ar_jo
                                     SET NoBrowserLang=ar)
IF {%LaunchPadLocaleID%} == {3401} ( SET LaunchPadLocale=ar_kw
                                     SET NoBrowserLang=ar)
IF {%LaunchPadLocaleID%} == {3001} ( SET LaunchPadLocale=ar_lb
                                     SET NoBrowserLang=ar)
IF {%LaunchPadLocaleID%} == {1001} ( SET LaunchPadLocale=ar_ly
                                     SET NoBrowserLang=ar)
IF {%LaunchPadLocaleID%} == {1801} ( SET LaunchPadLocale=ar_ma
                                     SET NoBrowserLang=ar)
IF {%LaunchPadLocaleID%} == {2001} ( SET LaunchPadLocale=ar_om
                                     SET NoBrowserLang=ar)
IF {%LaunchPadLocaleID%} == {4001} ( SET LaunchPadLocale=ar_qa
                                     SET NoBrowserLang=ar)
IF {%LaunchPadLocaleID%} == {0401} ( SET LaunchPadLocale=ar_sa
                                     SET NoBrowserLang=ar)
IF {%LaunchPadLocaleID%} == {2801} ( SET LaunchPadLocale=ar_sy
                                     SET NoBrowserLang=ar)
IF {%LaunchPadLocaleID%} == {1C01} ( SET LaunchPadLocale=ar_tn
                                     SET NoBrowserLang=ar)
IF {%LaunchPadLocaleID%} == {1c01} ( SET LaunchPadLocale=ar_tn
                                     SET NoBrowserLang=ar)
IF {%LaunchPadLocaleID%} == {2401} ( SET LaunchPadLocale=ar_ye
                                     SET NoBrowserLang=ar)

REM Belarusian
IF {%LaunchPadLocaleID%} == {0423} ( SET LaunchPadLocale=be
                                     SET NoBrowserLang=be)

REM Bulgarian
IF {%LaunchPadLocaleID%} == {0402} ( SET LaunchPadLocale=bg
                                     SET NoBrowserLang=bg)

REM Catalan
IF {%LaunchPadLocaleID%} == {0403} ( SET LaunchPadLocale=ca
                                     SET NoBrowserLang=ca)

REM Chinese
IF {%LaunchPadLocaleID%} == {0804} ( SET LaunchPadLocale=zh_cn
                                     SET NoBrowserLang=zh)
IF {%LaunchPadLocaleID%} == {0C04} ( SET LaunchPadLocale=zh_hk
                                     SET NoBrowserLang=zh)
IF {%LaunchPadLocaleID%} == {0c04} ( SET LaunchPadLocale=zh_hk
                                     SET NoBrowserLang=zh)
IF {%LaunchPadLocaleID%} == {1404} ( SET LaunchPadLocale=zh_mo
                                     SET NoBrowserLang=zh)
IF {%LaunchPadLocaleID%} == {1004} ( SET LaunchPadLocale=zh_sg
                                     SET NoBrowserLang=zh)
IF {%LaunchPadLocaleID%} == {0404} ( SET LaunchPadLocale=zh_TW
                                     SET NoBrowserLang=zh_TW)

REM Croation
IF {%LaunchPadLocaleID%} == {041A} ( SET LaunchPadLocale=hr
                                     SET NoBrowserLang=hr)
IF {%LaunchPadLocaleID%} == {041a} ( SET LaunchPadLocale=hr
                                     SET NoBrowserLang=hr)

REM Czech
IF {%LaunchPadLocaleID%} == {0405} ( SET LaunchPadLocale=cs
                                     SET NoBrowserLang=cs)

REM Danish
IF {%LaunchPadLocaleID%} == {0406} ( SET LaunchPadLocale=da
                                     SET NoBrowserLang=da)

REM Dutch
IF {%LaunchPadLocaleID%} == {0413} ( SET LaunchPadLocale=nl_nl
                                     SET NoBrowserLang=nl)
IF {%LaunchPadLocaleID%} == {0813} ( SET LaunchPadLocale=nl_be
                                     SET NoBrowserLang=nl)

REM English
IF {%LaunchPadLocaleID%} == {0C09} ( SET LaunchPadLocale=en_au
                                     SET NoBrowserLang=en)
IF {%LaunchPadLocaleID%} == {0c09} ( SET LaunchPadLocale=en_au
                                     SET NoBrowserLang=en)
IF {%LaunchPadLocaleID%} == {2809} ( SET LaunchPadLocale=en_bz
                                     SET NoBrowserLang=en)
IF {%LaunchPadLocaleID%} == {1009} ( SET LaunchPadLocale=en_ca
                                     SET NoBrowserLang=en)
IF {%LaunchPadLocaleID%} == {2409} ( SET LaunchPadLocale=en_cb
                                     SET NoBrowserLang=en)
IF {%LaunchPadLocaleID%} == {1809} ( SET LaunchPadLocale=en_ie
                                     SET NoBrowserLang=en)
IF {%LaunchPadLocaleID%} == {2009} ( SET LaunchPadLocale=en_jm
                                     SET NoBrowserLang=en)
IF {%LaunchPadLocaleID%} == {1409} ( SET LaunchPadLocale=en_nz
                                     SET NoBrowserLang=en)
IF {%LaunchPadLocaleID%} == {3409} ( SET LaunchPadLocale=en_ph
                                     SET NoBrowserLang=en)
IF {%LaunchPadLocaleID%} == {1C09} ( SET LaunchPadLocale=en_za
                                     SET NoBrowserLang=en)
IF {%LaunchPadLocaleID%} == {1c09} ( SET LaunchPadLocale=en_za
                                     SET NoBrowserLang=en)
IF {%LaunchPadLocaleID%} == {2C09} ( SET LaunchPadLocale=en_tt
                                     SET NoBrowserLang=en)
IF {%LaunchPadLocaleID%} == {2c09} ( SET LaunchPadLocale=en_tt
                                     SET NoBrowserLang=en)
IF {%LaunchPadLocaleID%} == {0809} ( SET LaunchPadLocale=en_gb
                                     SET NoBrowserLang=en)
IF {%LaunchPadLocaleID%} == {0409} ( SET LaunchPadLocale=en_us
                                     SET NoBrowserLang=en)

REM Estonian
IF {%LaunchPadLocaleID%} == {0425} ( SET LaunchPadLocale=et
                                     SET NoBrowserLang=et)

REM Farsi
IF {%LaunchPadLocaleID%} == {0429} ( SET LaunchPadLocale=fa
                                     SET NoBrowserLang=fa)

REM Finnish
IF {%LaunchPadLocaleID%} == {040B} ( SET LaunchPadLocale=fi
                                     SET NoBrowserLang=fi)
IF {%LaunchPadLocaleID%} == {040b} ( SET LaunchPadLocale=fi
                                     SET NoBrowserLang=fi)

REM French
IF {%LaunchPadLocaleID%} == {040C} ( SET LaunchPadLocale=fr_fr
                                     SET NoBrowserLang=fr)
IF {%LaunchPadLocaleID%} == {040c} ( SET LaunchPadLocale=fr_fr
                                     SET NoBrowserLang=fr)
IF {%LaunchPadLocaleID%} == {080C} ( SET LaunchPadLocale=fr_be
                                     SET NoBrowserLang=fr)
IF {%LaunchPadLocaleID%} == {080c} ( SET LaunchPadLocale=fr_be
                                     SET NoBrowserLang=fr)
IF {%LaunchPadLocaleID%} == {0C0C} ( SET LaunchPadLocale=fr_ca
                                     SET NoBrowserLang=fr)
IF {%LaunchPadLocaleID%} == {0c0c} ( SET LaunchPadLocale=fr_ca
                                     SET NoBrowserLang=fr)
IF {%LaunchPadLocaleID%} == {140C} ( SET LaunchPadLocale=fr_lu
                                     SET NoBrowserLang=fr)
IF {%LaunchPadLocaleID%} == {140c} ( SET LaunchPadLocale=fr_lu
                                     SET NoBrowserLang=fr)
IF {%LaunchPadLocaleID%} == {100C} ( SET LaunchPadLocale=fr_ch
                                     SET NoBrowserLang=fr)
IF {%LaunchPadLocaleID%} == {100c} ( SET LaunchPadLocale=fr_ch
                                     SET NoBrowserLang=fr)

REM German
IF {%LaunchPadLocaleID%} == {0407} ( SET LaunchPadLocale=de_de
                                     SET NoBrowserLang=de)
IF {%LaunchPadLocaleID%} == {0C07} ( SET LaunchPadLocale=de_at
                                     SET NoBrowserLang=de)
IF {%LaunchPadLocaleID%} == {0c07} ( SET LaunchPadLocale=de_at
                                     SET NoBrowserLang=de)
IF {%LaunchPadLocaleID%} == {1407} ( SET LaunchPadLocale=de_li
                                     SET NoBrowserLang=de)
IF {%LaunchPadLocaleID%} == {1007} ( SET LaunchPadLocale=de_lu
                                     SET NoBrowserLang=de)
IF {%LaunchPadLocaleID%} == {0807} ( SET LaunchPadLocale=de_ch
                                     SET NoBrowserLang=de)

REM Greek
IF {%LaunchPadLocaleID%} == {0408} ( SET LaunchPadLocale=el
                                     SET NoBrowserLang=el)
REM Hebrew

IF {%LaunchPadLocaleID%} == {040D} ( SET LaunchPadLocale=he
                                     SET NoBrowserLang=he)
IF {%LaunchPadLocaleID%} == {040d} ( SET LaunchPadLocale=he
                                     SET NoBrowserLang=he)
									 

REM Hindi
IF {%LaunchPadLocaleID%} == {0439} ( SET LaunchPadLocale=hi
                                     SET NoBrowserLang=hi)

REM Hungarian
IF {%LaunchPadLocaleID%} == {040E} ( SET LaunchPadLocale=hu
                                     SET NoBrowserLang=hu)
IF {%LaunchPadLocaleID%} == {040e} ( SET LaunchPadLocale=hu
                                     SET NoBrowserLang=hu)

REM Indonesian
IF {%LaunchPadLocaleID%} == {0421} ( SET LaunchPadLocale=id
                                     SET NoBrowserLang=id)

REM Italian
IF {%LaunchPadLocaleID%} == {0410} ( SET LaunchPadLocale=it_it
                                     SET NoBrowserLang=it)
IF {%LaunchPadLocaleID%} == {0810} ( SET LaunchPadLocale=it_ch
                                     SET NoBrowserLang=it)

REM Japanese
IF {%LaunchPadLocaleID%} == {0411} ( SET LaunchPadLocale=ja
                                     SET NoBrowserLang=ja)

REM Korean
IF {%LaunchPadLocaleID%} == {0412} ( SET LaunchPadLocale=ko
                                     SET NoBrowserLang=ko)

REM Latvian
IF {%LaunchPadLocaleID%} == {0426} ( SET LaunchPadLocale=lv
                                     SET NoBrowserLang=lv)

REM Lithuanian
IF {%LaunchPadLocaleID%} == {0427} ( SET LaunchPadLocale=lt
                                     SET NoBrowserLang=lt)

REM Macedonian
IF {%LaunchPadLocaleID%} == {042F} ( SET LaunchPadLocale=mk
                                     SET NoBrowserLang=mk)
IF {%LaunchPadLocaleID%} == {042f} ( SET LaunchPadLocale=mk
                                     SET NoBrowserLang=mk)

REM Malaysian
IF {%LaunchPadLocaleID%} == {043E} ( SET LaunchPadLocale=ms_my
                                     SET NoBrowserLang=ms)
IF {%LaunchPadLocaleID%} == {043e} ( SET LaunchPadLocale=ms_my
                                     SET NoBrowserLang=ms)
IF {%LaunchPadLocaleID%} == {083E} ( SET LaunchPadLocale=ms_bn
                                     SET NoBrowserLang=ms)
IF {%LaunchPadLocaleID%} == {083e} ( SET LaunchPadLocale=ms_bn
                                     SET NoBrowserLang=ms)

REM Norwegian
IF {%LaunchPadLocaleID%} == {0414} ( SET LaunchPadLocale=no_no
                                     SET NoBrowserLang=no)
IF {%LaunchPadLocaleID%} == {0814} ( SET LaunchPadLocale=no_no
                                     SET NoBrowserLang=no)

REM Polish
IF {%LaunchPadLocaleID%} == {0415} ( SET LaunchPadLocale=pl
                                     SET NoBrowserLang=pl)

REM Portuguese
IF {%LaunchPadLocaleID%} == {0816} ( SET LaunchPadLocale=pt_pt
                                     SET NoBrowserLang=pt)
IF {%LaunchPadLocaleID%} == {0416} ( SET LaunchPadLocale=pt_BR
                                     SET NoBrowserLang=pt_BR)

REM Romanian
IF {%LaunchPadLocaleID%} == {0418} ( SET LaunchPadLocale=ro
                                     SET NoBrowserLang=ro)
IF {%LaunchPadLocaleID%} == {0818} ( SET LaunchPadLocale=ro_mo
                                     SET NoBrowserLang=ro)

REM Russian
IF {%LaunchPadLocaleID%} == {0419} ( SET LaunchPadLocale=ru
                                     SET NoBrowserLang=ru)
IF {%LaunchPadLocaleID%} == {0818} ( SET LaunchPadLocale=ru_mo
                                     SET NoBrowserLang=ru)

REM Serbian
IF {%LaunchPadLocaleID%} == {0C1A} ( SET LaunchPadLocale=sr_sp
                                     SET NoBrowserLang=sr)
IF {%LaunchPadLocaleID%} == {0c1a} ( SET LaunchPadLocale=sr_sp
                                     SET NoBrowserLang=sr)
IF {%LaunchPadLocaleID%} == {081A} ( SET LaunchPadLocale=sr_sp
                                     SET NoBrowserLang=sr)
IF {%LaunchPadLocaleID%} == {081a} ( SET LaunchPadLocale=sr_sp
                                     SET NoBrowserLang=sr)

REM Slovenian
IF {%LaunchPadLocaleID%} == {0424} ( SET LaunchPadLocale=sl
                                     SET NoBrowserLang=sl)

REM Slovak
IF {%LaunchPadLocaleID%} == {041B} ( SET LaunchPadLocale=sk
                                     SET NoBrowserLang=sk)
IF {%LaunchPadLocaleID%} == {041b} ( SET LaunchPadLocale=sk
                                     SET NoBrowserLang=sk)

REM Spanish
IF {%LaunchPadLocaleID%} == {0C0A} ( SET LaunchPadLocale=es_es
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {0c0a} ( SET LaunchPadLocale=es_es
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {2C0A} ( SET LaunchPadLocale=es_ar
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {2c0a} ( SET LaunchPadLocale=es_ar
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {400A} ( SET LaunchPadLocale=es_cl
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {400a} ( SET LaunchPadLocale=es_cl
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {240A} ( SET LaunchPadLocale=es_co
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {240a} ( SET LaunchPadLocale=es_co
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {1C0A} ( SET LaunchPadLocale=es_do
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {1c0a} ( SET LaunchPadLocale=es_do
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {300A} ( SET LaunchPadLocale=es_ec
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {300a} ( SET LaunchPadLocale=es_ec
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {100A} ( SET LaunchPadLocale=es_gt
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {100a} ( SET LaunchPadLocale=es_gt
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {480A} ( SET LaunchPadLocale=es_hn
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {480a} ( SET LaunchPadLocale=es_hn
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {080A} ( SET LaunchPadLocale=es_mx
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {080a} ( SET LaunchPadLocale=es_mx
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {4C0A} ( SET LaunchPadLocale=es_ni
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {4c0a} ( SET LaunchPadLocale=es_ni
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {180A} ( SET LaunchPadLocale=es_pa
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {180a} ( SET LaunchPadLocale=es_pa
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {280A} ( SET LaunchPadLocale=es_pe
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {280a} ( SET LaunchPadLocale=es_pe
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {500A} ( SET LaunchPadLocale=es_pr
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {500a} ( SET LaunchPadLocale=es_pr
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {3C0A} ( SET LaunchPadLocale=es_py
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {3c0a} ( SET LaunchPadLocale=es_py
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {440A} ( SET LaunchPadLocale=es_sv
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {440a} ( SET LaunchPadLocale=es_sv
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {380A} ( SET LaunchPadLocale=es_uy
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {380a} ( SET LaunchPadLocale=es_uy
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {200A} ( SET LaunchPadLocale=es_ve
                                     SET NoBrowserLang=es)
IF {%LaunchPadLocaleID%} == {200a} ( SET LaunchPadLocale=es_ve
                                     SET NoBrowserLang=es)

REM Swedish
IF {%LaunchPadLocaleID%} == {041D} ( SET LaunchPadLocale=sv_se
                                     SET NoBrowserLang=sv)
IF {%LaunchPadLocaleID%} == {041d} ( SET LaunchPadLocale=sv_se
                                     SET NoBrowserLang=sv)
IF {%LaunchPadLocaleID%} == {081D} ( SET LaunchPadLocale=sv_fi
                                     SET NoBrowserLang=sv)
IF {%LaunchPadLocaleID%} == {081d} ( SET LaunchPadLocale=sv_fi
                                     SET NoBrowserLang=sv)

REM Turkish
IF {%LaunchPadLocaleID%} == {041F} ( SET LaunchPadLocale=tr
                                     SET NoBrowserLang=tr)
IF {%LaunchPadLocaleID%} == {041f} ( SET LaunchPadLocale=tr
                                     SET NoBrowserLang=tr)

REM Ukranian
IF {%LaunchPadLocaleID%} == {0422} ( SET LaunchPadLocale=uk
                                     SET NoBrowserLang=uk)

REM Vietnamese
IF {%LaunchPadLocaleID%} == {042A} ( SET LaunchPadLocale=vi
                                     SET NoBrowserLang=vi)

:DONE
echo.%LaunchPadLocale%
