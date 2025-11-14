# Define here the models for your spider middleware
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/spider-middleware.html

import random
import logging
from scrapy import signals
from scrapy.http import HtmlResponse
from scrapy.downloadermiddlewares.useragent import UserAgentMiddleware
from scrapy.downloadermiddlewares.retry import RetryMiddleware
from scrapy.utils.response import response_status_message

logger = logging.getLogger(__name__)


class AccorriaScraperSpiderMiddleware:
    """Spider middleware for Accorria scraper"""
    
    @classmethod
    def from_crawler(cls, crawler):
        s = cls()
        crawler.signals.connect(s.spider_opened, signal=signals.spider_opened)
        return s

    def process_spider_input(self, response, spider):
        return None

    def process_spider_output(self, response, result, spider):
        for i in result:
            yield i

    def process_spider_exception(self, response, exception, spider):
        pass

    def process_start_requests(self, start_requests, spider):
        for r in start_requests:
            yield r

    def spider_opened(self, spider):
        spider.logger.info('Spider opened: %s' % spider.name)


class AccorriaScraperDownloaderMiddleware:
    """Downloader middleware for Accorria scraper"""
    
    @classmethod
    def from_crawler(cls, crawler):
        return cls()

    def process_request(self, request, spider):
        return None

    def process_response(self, request, response, spider):
        return response

    def process_exception(self, request, exception, spider):
        pass

    def spider_opened(self, spider):
        spider.logger.info('Spider opened: %s' % spider.name)


class RotateUserAgentMiddleware(UserAgentMiddleware):
    """Rotate user agents to avoid detection"""
    
    def __init__(self, user_agent=''):
        self.user_agent = user_agent
        self.user_agent_list = [
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0',
        ]

    def process_request(self, request, spider):
        ua = random.choice(self.user_agent_list)
        request.headers['User-Agent'] = ua
        return None


class ProxyMiddleware:
    """Proxy middleware for rotating IPs (optional)"""
    
    def __init__(self):
        # Add proxy list here if needed
        self.proxies = []
    
    def process_request(self, request, spider):
        if self.proxies:
            proxy = random.choice(self.proxies)
            request.meta['proxy'] = proxy
        return None


class CustomRetryMiddleware(RetryMiddleware):
    """Custom retry middleware with better error handling"""
    
    def __init__(self, settings):
        super().__init__(settings)
        self.retry_http_codes = set(int(x) for x in settings.getlist('RETRY_HTTP_CODES'))
        self.retry_times = settings.getint('RETRY_TIMES')
        self.retry_priority_adjust = settings.getint('RETRY_PRIORITY_ADJUST')

    def process_response(self, request, response, spider):
        if request.meta.get('dont_retry', False):
            return response
        
        if response.status in self.retry_http_codes:
            reason = response_status_message(response.status)
            return self._retry(request, reason, spider) or response
        
        return response

    def process_exception(self, request, exception, spider):
        if isinstance(exception, self.EXCEPTIONS_TO_RETRY) and not request.meta.get('dont_retry', False):
            return self._retry(request, exception, spider)


class SeleniumMiddleware:
    """Middleware for handling JavaScript-heavy pages with Selenium"""
    
    def __init__(self):
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from webdriver_manager.chrome import ChromeDriverManager
        from selenium.webdriver.chrome.service import Service
        
        self.driver = None
        self.setup_driver()
    
    def setup_driver(self):
        """Setup Chrome driver with options"""
        try:
            from selenium import webdriver
            from selenium.webdriver.chrome.options import Options
            from webdriver_manager.chrome import ChromeDriverManager
            from selenium.webdriver.chrome.service import Service
            
            chrome_options = Options()
            chrome_options.add_argument('--headless')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--window-size=1920,1080')
            chrome_options.add_argument('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
            
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            logger.info("Selenium driver initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Selenium driver: {e}")
            self.driver = None
    
    def process_request(self, request, spider):
        """Process request with Selenium if needed"""
        if request.meta.get('use_selenium', False) and self.driver:
            try:
                self.driver.get(request.url)
                # Wait for page to load
                import time
                time.sleep(2)
                
                # Get page source
                body = self.driver.page_source
                return HtmlResponse(
                    url=request.url,
                    body=body,
                    encoding='utf-8',
                    request=request
                )
            except Exception as e:
                logger.error(f"Selenium request failed: {e}")
                return None
        
        return None
    
    def spider_closed(self, spider):
        """Close driver when spider closes"""
        if self.driver:
            self.driver.quit()
            logger.info("Selenium driver closed")
