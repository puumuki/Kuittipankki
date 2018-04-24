from setuptools import setup

setup(
  name='kuittipankki-postgres-migration',
  version='1.0',
  description='Kuittipankki postgres migration tool',
  url='https://github.com/puumuki/Kuittipankki/tree/master/scripts/postgres-migration',
  author='Teemu Puukko',
  author_email='teemuki@gmail.com',
  license='MIT',
  packages=[''],
  install_requires=[
      'sqlalchemy'
  ],
  zip_safe=False
)