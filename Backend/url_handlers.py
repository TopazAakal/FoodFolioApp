# pylint: disable=C0303 wildcard-import unused-wildcard-import trailing-whitespace no-member unused-argument missing-module-docstring broad-exception-caught trailing-whitespace line-too-long missing-function-docstring
from general import get_domain_name
from handlers import *

def handle_url(url):
    domain_name = get_domain_name(url)    
    
    match domain_name:
        case "www.ronyohananov.com" | "www.shiriamit.co.il":
            return handle_ron_yohananov(url)
        case "foody.co.il":
            return handle_foody(url)
        case "kobiedri.co.il":
            return handle_kobi_edri(url)
        case "www.krutit.co.il":
            return handle_krutit(url)
        case "www.hashulchan.co.il":
            return handle_hashulchan(url)
        case "www.10dakot.co.il":
            return handle_10dakot(url)
        case "danielamit.foody.co.il":
            return handle_foody(url)
        case "elitaofek.co.il":
            return handle_elita_ofek(url)
        case "adikosh.co.il":
            return handle_adikosh(url)
        case "www.anatelisha.co.il":
            return handle_anat_elisha(url)
        case "lizapanelim.com" | "www.lizapanelim.com":
            return handle_liza_panelim(url)
            
        case _:
            return Exception(f'No handler found for domain: {domain_name}')
